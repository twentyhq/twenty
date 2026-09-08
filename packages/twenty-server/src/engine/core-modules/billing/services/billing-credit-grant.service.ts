/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { type EntityManager, IsNull, LessThan, MoreThan } from 'typeorm';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCreditGrantEntity } from 'src/engine/core-modules/billing/entities/billing-credit-grant.entity';
import { type BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export type CreateBillingCreditGrantParams = {
  workspaceId: string;
  amountMicro: number;
  type: BillingCreditGrantType;
  effectiveAt: Date;
  // Null means the credits stay spendable until something settles them, which
  // is the default. See the entity for why an expiry is a tombstone here.
  expiresAt: Date | null;
  reason?: string | null;
  grantedByUserId?: string | null;
  idempotencyKey?: string | null;
  sourceGrantId?: string | null;
};

// Owns the billingCreditGrant table. Deliberately free of side effects so that
// read paths (available credits) can depend on it without pulling in the cache
// and subscription services that BillingCreditService needs.
@Injectable()
export class BillingCreditGrantService {
  constructor(
    @InjectWorkspaceScopedRepository(BillingCreditGrantEntity)
    private readonly billingCreditGrantRepository: WorkspaceScopedRepository<BillingCreditGrantEntity>,
  ) {}

  // Returns null when idempotencyKey has already been used, so callers can tell
  // a fresh grant from a replayed one.
  async createGrant(
    params: CreateBillingCreditGrantParams,
    entityManager?: EntityManager,
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

    if (isDefined(expiresAt) && expiresAt.getTime() <= effectiveAt.getTime()) {
      throw new BillingException(
        `Cannot grant credits to workspace ${workspaceId} expiring at ${expiresAt.toISOString()}, before or when they become effective at ${effectiveAt.toISOString()}`,
        BillingExceptionCode.BILLING_CREDIT_GRANT_VALIDITY_INVALID,
      );
    }

    const repository = this.getRepository(entityManager);

    // Idempotency is enforced by letting Postgres drop the duplicate rather
    // than by catching the unique violation: the rollover inserts inside a
    // transaction, where a raised constraint error would abort every write
    // that came before it.
    const { raw } = await repository
      .createQueryBuilder()
      .insert()
      .values({
        workspaceId,
        amountMicro,
        type,
        effectiveAt,
        expiresAt,
        reason,
        grantedByUserId,
        idempotencyKey,
        sourceGrantId,
      })
      .orIgnore()
      .returning('id')
      .execute();

    const [insertedRow] = raw as { id?: string }[];
    const grantId = insertedRow?.id;

    if (!isDefined(grantId)) {
      return null;
    }

    // Read back rather than returning the raw row, which skips the bigint
    // transformer and would hand callers amountMicro as a string.
    return repository.findOne(workspaceId, { where: { id: grantId } });
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
      .andWhere(
        '("billingCreditGrant"."expiresAt" IS NULL OR "billingCreditGrant"."expiresAt" > now())',
      )
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

  // Grants that were spendable at any point during the given period.
  async findGrantsLiveDuringPeriod(
    {
      workspaceId,
      periodStart,
      periodEnd,
    }: {
      workspaceId: string;
      periodStart: Date;
      periodEnd: Date;
    },
    entityManager?: EntityManager,
  ): Promise<BillingCreditGrantEntity[]> {
    return this.getRepository(entityManager).find(workspaceId, {
      where: [
        {
          revokedAt: IsNull(),
          effectiveAt: LessThan(periodEnd),
          expiresAt: IsNull(),
        },
        {
          revokedAt: IsNull(),
          effectiveAt: LessThan(periodEnd),
          expiresAt: MoreThan(periodStart),
        },
      ],
      order: { createdAt: 'ASC' },
    });
  }

  // Caps how long a computed credit balance may stay cached: an operator-set
  // expiry falling inside a period would otherwise go unnoticed until the next
  // one, and the workspace would keep spending credits that already lapsed.
  async findEarliestUpcomingExpiry(workspaceId: string): Promise<Date | null> {
    const [row] = await this.billingCreditGrantRepository.find(workspaceId, {
      where: { revokedAt: IsNull(), expiresAt: MoreThan(new Date()) },
      order: { expiresAt: 'ASC' },
      take: 1,
    });

    return row?.expiresAt ?? null;
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

  // Settles every grant the closing period could still spend, so that the
  // carry-forward rows written next in the same transaction are the only ones
  // left live. Matched by predicate rather than by id so a grant created while
  // the transition runs is covered too.
  async closeGrantsAtPeriodEnd(
    {
      workspaceId,
      periodEnd,
    }: {
      workspaceId: string;
      periodEnd: Date;
    },
    entityManager?: EntityManager,
  ): Promise<void> {
    const repository = this.getRepository(entityManager);

    // Two passes because a single criteria object cannot express the OR, and
    // an operator-set expiry already inside the period must be left alone.
    const liveExpiries = [IsNull(), MoreThan(periodEnd)];

    for (const expiresAt of liveExpiries) {
      await repository.update(
        workspaceId,
        {
          revokedAt: IsNull(),
          effectiveAt: LessThan(periodEnd),
          expiresAt,
        },
        { expiresAt: periodEnd },
      );
    }
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

  async findGrantByIdempotencyKey(
    workspaceId: string,
    idempotencyKey: string,
  ): Promise<BillingCreditGrantEntity | null> {
    const grant = await this.billingCreditGrantRepository.findOne(workspaceId, {
      where: { idempotencyKey },
    });

    return grant ?? null;
  }

  private getRepository(
    entityManager?: EntityManager,
  ): WorkspaceScopedRepository<BillingCreditGrantEntity> {
    return isDefined(entityManager)
      ? this.billingCreditGrantRepository.withManager(entityManager)
      : this.billingCreditGrantRepository;
  }
}
