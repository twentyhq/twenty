/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, LessThan, MoreThan } from 'typeorm';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCreditGrantEntity } from 'src/engine/core-modules/billing/entities/billing-credit-grant.entity';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

// Shared with the backfill instance command so the two are safe in either
// order: whichever runs first claims the key, the other is a no-op.
const LEGACY_BALANCE_IDEMPOTENCY_KEY_PREFIX = 'backfill-credit-balance:';

export type CreateBillingCreditGrantParams = {
  workspaceId: string;
  amountMicro: number;
  type: BillingCreditGrantType;
  effectiveAt: Date;
  expiresAt: Date;
  reason?: string | null;
  grantedByUserId?: string | null;
  idempotencyKey?: string | null;
  sourceGrantId?: string | null;
};

const getPostgresErrorCode = (error: unknown): string | undefined => {
  if (!isDefined(error) || typeof error !== 'object' || !('code' in error)) {
    return undefined;
  }

  return typeof error.code === 'string' ? error.code : undefined;
};

// TypeORM wraps the driver error, and which of the two carries the code
// depends on how the query was issued.
const isUniqueViolation = (error: unknown): boolean => {
  if (getPostgresErrorCode(error) === POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION) {
    return true;
  }

  if (
    !isDefined(error) ||
    typeof error !== 'object' ||
    !('driverError' in error)
  ) {
    return false;
  }

  return (
    getPostgresErrorCode(error.driverError) ===
    POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION
  );
};

// Owns the billingCreditGrant table. Deliberately free of side effects so that
// read paths (available credits) can depend on it without pulling in the cache
// and subscription services that BillingCreditService needs.
@Injectable()
export class BillingCreditGrantService {
  constructor(
    @InjectWorkspaceScopedRepository(BillingCreditGrantEntity)
    private readonly billingCreditGrantRepository: WorkspaceScopedRepository<BillingCreditGrantEntity>,
    @InjectWorkspaceScopedRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: WorkspaceScopedRepository<BillingCustomerEntity>,
  ) {}

  // Returns null when idempotencyKey has already been used, so callers can tell
  // a fresh grant from a replayed one.
  async createGrant(
    params: CreateBillingCreditGrantParams,
  ): Promise<BillingCreditGrantEntity | null> {
    const {
      workspaceId,
      amountMicro,
      type,
      effectiveAt,
      expiresAt,
      reason = null,
      grantedByUserId = null,
      idempotencyKey = null,
      sourceGrantId = null,
    } = params;

    if (!Number.isSafeInteger(amountMicro) || amountMicro <= 0) {
      throw new BillingException(
        `Cannot grant an amount (${amountMicro}) that is not a positive safe integer to workspace ${workspaceId}`,
        BillingExceptionCode.BILLING_CREDIT_AMOUNT_INVALID,
      );
    }

    if (expiresAt.getTime() <= effectiveAt.getTime()) {
      throw new BillingException(
        `Cannot grant credits to workspace ${workspaceId} expiring at ${expiresAt.toISOString()}, before or when they become effective at ${effectiveAt.toISOString()}`,
        BillingExceptionCode.BILLING_CREDIT_GRANT_VALIDITY_INVALID,
      );
    }

    try {
      const { identifiers, generatedMaps } =
        await this.billingCreditGrantRepository.insert(workspaceId, {
          amountMicro,
          type,
          effectiveAt,
          expiresAt,
          reason,
          grantedByUserId,
          idempotencyKey,
          sourceGrantId,
        });

      const insertedId = identifiers[0]?.id ?? generatedMaps[0]?.id;
      const grantId = typeof insertedId === 'string' ? insertedId : undefined;

      if (!isDefined(grantId)) {
        return null;
      }

      return this.billingCreditGrantRepository.findOne(workspaceId, {
        where: { id: grantId },
      });
    } catch (error) {
      if (isDefined(idempotencyKey) && isUniqueViolation(error)) {
        return null;
      }

      throw error;
    }
  }

  async getActiveCreditsMicro(workspaceId: string): Promise<number> {
    const result = await this.billingCreditGrantRepository
      .createQueryBuilder('billingCreditGrant')
      .select('COALESCE(SUM("billingCreditGrant"."amountMicro"), 0)', 'total')
      .where('"billingCreditGrant"."workspaceId" = :workspaceId', {
        workspaceId,
      })
      .andWhere('"billingCreditGrant"."revokedAt" IS NULL')
      .andWhere('"billingCreditGrant"."effectiveAt" <= now()')
      .andWhere('"billingCreditGrant"."expiresAt" > now()')
      .getRawOne<{ total: string | number | null }>();

    const total = Number(result?.total ?? 0);

    // Rounding a balance would hand out or withhold credits that were never
    // granted, so refuse rather than serve a number we cannot represent.
    if (!Number.isSafeInteger(total)) {
      throw new BillingException(
        `Credit balance for workspace ${workspaceId} is not a safe integer (${total})`,
        BillingExceptionCode.BILLING_CREDIT_AMOUNT_INVALID,
      );
    }

    return total;
  }

  // Moves a not-yet-backfilled balance into the ledger before anything writes
  // to it. Without this the first grant recomputes the mirror column from a
  // ledger that does not hold the legacy balance yet, erasing it.
  // Remove along with creditBalanceMicro.
  async materializeLegacyBalance({
    workspaceId,
    effectiveAt,
    expiresAt,
  }: {
    workspaceId: string;
    effectiveAt: Date;
    expiresAt: Date;
  }): Promise<void> {
    if (await this.hasAnyGrant(workspaceId)) {
      return;
    }

    const legacyBalanceMicro = await this.getMirroredBalanceMicro(workspaceId);

    if (legacyBalanceMicro <= 0) {
      return;
    }

    await this.createGrant({
      workspaceId,
      amountMicro: legacyBalanceMicro,
      type: BillingCreditGrantType.ROLLOVER,
      effectiveAt,
      expiresAt,
      reason: 'Backfilled from billingCustomer.creditBalanceMicro',
      idempotencyKey: `${LEGACY_BALANCE_IDEMPOTENCY_KEY_PREFIX}${workspaceId}`,
    });
  }

  // What a workspace can actually spend, which is the ledger except in the
  // window between this release deploying and its backfill running: until a
  // workspace has any grant at all, its balance still only exists in the
  // mirror column. Remove along with creditBalanceMicro.
  async getSpendableCreditsMicro(workspaceId: string): Promise<number> {
    if (await this.hasAnyGrant(workspaceId)) {
      return this.getActiveCreditsMicro(workspaceId);
    }

    return this.getMirroredBalanceMicro(workspaceId);
  }

  // Grants that were spendable at any point during the given period.
  async findGrantsLiveDuringPeriod({
    workspaceId,
    periodStart,
    periodEnd,
  }: {
    workspaceId: string;
    periodStart: Date;
    periodEnd: Date;
  }): Promise<BillingCreditGrantEntity[]> {
    return this.billingCreditGrantRepository.find(workspaceId, {
      where: {
        revokedAt: IsNull(),
        effectiveAt: LessThan(periodEnd),
        expiresAt: MoreThan(periodStart),
      },
      order: { createdAt: 'ASC' },
    });
  }

  // The previous transition pulled every grant it closed back to the instant
  // the period ended, so the ledger records where the closing period started.
  // Calendar arithmetic cannot recover it once the subscription has moved on:
  // a month-end anchor clamps, and subtracting a month from February 28 gives
  // January 28 rather than the January 31 the period actually started on.
  async findPeriodStartBefore({
    workspaceId,
    boundary,
  }: {
    workspaceId: string;
    boundary: Date;
  }): Promise<Date | null> {
    const [row] = await this.billingCreditGrantRepository.find(workspaceId, {
      where: { expiresAt: LessThan(boundary) },
      order: { expiresAt: 'DESC' },
      take: 1,
    });

    return row?.expiresAt ?? null;
  }

  // Enforces the one-grant-per-period invariant at the point where periods
  // actually roll: whatever a writer guessed for expiresAt, a grant never
  // outlives the period it was carried forward from. Matched by predicate
  // rather than by id so a grant created while the transition runs is covered
  // too.
  async closeGrantsAtPeriodEnd({
    workspaceId,
    periodEnd,
  }: {
    workspaceId: string;
    periodEnd: Date;
  }): Promise<void> {
    await this.billingCreditGrantRepository.update(
      workspaceId,
      {
        revokedAt: IsNull(),
        effectiveAt: LessThan(periodEnd),
        expiresAt: MoreThan(periodEnd),
      },
      { expiresAt: periodEnd },
    );
  }

  async listGrants(workspaceId: string): Promise<BillingCreditGrantEntity[]> {
    return this.billingCreditGrantRepository.find(workspaceId, {
      order: { createdAt: 'DESC' },
    });
  }

  // wasRevokedNow tells a retried revocation apart from the one that actually
  // took the credits away, so callers only adjust balances once.
  async revokeGrant({
    workspaceId,
    grantId,
    revokedByUserId,
  }: {
    workspaceId: string;
    grantId: string;
    revokedByUserId?: string | null;
  }): Promise<{ grant: BillingCreditGrantEntity; wasRevokedNow: boolean }> {
    const grant = await this.billingCreditGrantRepository.findOne(workspaceId, {
      where: { id: grantId },
    });

    if (!isDefined(grant)) {
      throw new BillingException(
        `Credit grant ${grantId} not found for workspace ${workspaceId}`,
        BillingExceptionCode.BILLING_CREDIT_GRANT_NOT_FOUND,
      );
    }

    if (isDefined(grant.revokedAt)) {
      return { grant, wasRevokedNow: false };
    }

    const { affected } = await this.billingCreditGrantRepository.update(
      workspaceId,
      { id: grantId, revokedAt: IsNull() },
      { revokedAt: new Date(), revokedByUserId: revokedByUserId ?? null },
    );

    const revokedGrant = await this.billingCreditGrantRepository.findOneOrFail(
      workspaceId,
      { where: { id: grantId } },
    );

    // Two concurrent revocations both read an unrevoked grant; only the one
    // whose UPDATE matched may move the balance.
    return {
      grant: revokedGrant,
      wasRevokedNow: isDefined(affected) && affected > 0,
    };
  }

  // Whether the ledger has taken over from billingCustomer.creditBalanceMicro
  // for this workspace. Public so the mirror write can refuse to overwrite a
  // balance the backfill has not reached yet.
  async hasAnyGrant(workspaceId: string): Promise<boolean> {
    return this.billingCreditGrantRepository.exists(workspaceId, { where: {} });
  }

  private async getMirroredBalanceMicro(workspaceId: string): Promise<number> {
    const billingCustomer = await this.billingCustomerRepository.findOne(
      workspaceId,
      { select: { creditBalanceMicro: true }, where: {} },
    );

    return billingCustomer?.creditBalanceMicro ?? 0;
  }
}
