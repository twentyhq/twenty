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

@Injectable()
export class BillingCreditGrantService {
  constructor(
    @InjectWorkspaceScopedRepository(BillingCreditGrantEntity)
    private readonly billingCreditGrantRepository: WorkspaceScopedRepository<BillingCreditGrantEntity>,
    @InjectWorkspaceScopedRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: WorkspaceScopedRepository<BillingCustomerEntity>,
  ) {}

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

    if (!Number.isSafeInteger(total)) {
      throw new BillingException(
        `Credit balance for workspace ${workspaceId} is not a safe integer (${total})`,
        BillingExceptionCode.BILLING_CREDIT_AMOUNT_INVALID,
      );
    }

    return total;
  }

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

  async getSpendableCreditsMicro(workspaceId: string): Promise<number> {
    if (await this.hasAnyGrant(workspaceId)) {
      return this.getActiveCreditsMicro(workspaceId);
    }

    return this.getMirroredBalanceMicro(workspaceId);
  }

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

    return {
      grant: revokedGrant,
      wasRevokedNow: isDefined(affected) && affected > 0,
    };
  }

  async findGrantByIdempotencyKey(
    workspaceId: string,
    idempotencyKey: string,
  ): Promise<BillingCreditGrantEntity | null> {
    const grant = await this.billingCreditGrantRepository.findOne(workspaceId, {
      where: { idempotencyKey },
    });

    return grant ?? null;
  }

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
