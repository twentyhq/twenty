/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { type EntityManager, IsNull, LessThan, Like, MoreThan } from 'typeorm';

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
  // Null keeps the credits spendable until something settles them
  expiresAt: Date | null;
  reason?: string | null;
  grantedByUserId?: string | null;
  idempotencyKey?: string | null;
  sourceGrantId?: string | null;
};

// Side-effect free so read paths can depend on it without BillingCreditService's cache and subscription deps
@Injectable()
export class BillingCreditGrantService {
  constructor(
    @InjectWorkspaceScopedRepository(BillingCreditGrantEntity)
    private readonly billingCreditGrantRepository: WorkspaceScopedRepository<BillingCreditGrantEntity>,
  ) {}

  // Null when idempotencyKey was already used
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

    // Not a caught unique violation: inside the rollover transaction it would abort every earlier write
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

    // The raw row skips the bigint transformer and holds amountMicro as a string
    return repository.findOne(workspaceId, { where: { id: grantId } });
  }

  async getActiveCreditsMicro(workspaceId: string): Promise<number> {
    const { balanceMicro } = await this.getActiveCreditBalance({
      workspaceId,
      boundary: null,
    });

    return balanceMicro;
  }

  // One statement so the balance and its bounding expiry come from the same snapshot
  async getActiveCreditBalance({
    workspaceId,
    boundary,
  }: {
    workspaceId: string;
    boundary: Date | null;
  }): Promise<{ balanceMicro: number; earliestExpiryBefore: Date | null }> {
    const result = await this.billingCreditGrantRepository
      .createQueryBuilder('billingCreditGrant')
      .select('COALESCE(SUM("billingCreditGrant"."amountMicro"), 0)', 'total')
      .addSelect(
        isDefined(boundary)
          ? 'MIN("billingCreditGrant"."expiresAt") FILTER (WHERE "billingCreditGrant"."expiresAt" < :boundary)'
          : 'NULL',
        'earliestExpiry',
      )
      .where('"billingCreditGrant"."workspaceId" = :workspaceId', {
        workspaceId,
      })
      .andWhere('"billingCreditGrant"."revokedAt" IS NULL')
      .andWhere('"billingCreditGrant"."effectiveAt" <= now()')
      .andWhere(
        '("billingCreditGrant"."expiresAt" IS NULL OR "billingCreditGrant"."expiresAt" > now())',
      )
      .setParameters(isDefined(boundary) ? { boundary } : {})
      .getRawOne<{
        total: string | number | null;
        earliestExpiry: Date | string | null;
      }>();

    const balanceMicro = Number(result?.total ?? 0);

    // Refuse rather than round: rounding would hand out or withhold credits never granted
    if (!Number.isSafeInteger(balanceMicro)) {
      throw new BillingException(
        `Credit balance for workspace ${workspaceId} is not a safe integer (${balanceMicro})`,
        BillingExceptionCode.BILLING_CREDIT_AMOUNT_INVALID,
      );
    }

    return {
      balanceMicro,
      earliestExpiryBefore: isDefined(result?.earliestExpiry)
        ? new Date(result.earliestExpiry)
        : null,
    };
  }

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

  // Calendar arithmetic can't recover the period start: month-end anchors clamp (Feb 28 minus a month is Jan 28)
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

  // Matched by predicate, not id, so a grant created mid-transition is settled too
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

    // The OR leaves an operator-set expiry inside the period alone, or lapsed credits would come back
    await repository
      .createQueryBuilder()
      .update()
      .set({ expiresAt: periodEnd })
      .where('"workspaceId" = :workspaceId', { workspaceId })
      .andWhere('"revokedAt" IS NULL')
      .andWhere('"effectiveAt" < :periodEnd', { periodEnd })
      .andWhere('("expiresAt" IS NULL OR "expiresAt" > :periodEnd)', {
        periodEnd,
      })
      .execute();
  }

  async listGrants(workspaceId: string): Promise<BillingCreditGrantEntity[]> {
    return this.billingCreditGrantRepository.find(workspaceId, {
      order: { createdAt: 'DESC' },
    });
  }

  async countGrantsByIdempotencyKeyPrefix({
    workspaceId,
    type,
    idempotencyKeyPrefix,
  }: {
    workspaceId: string;
    type: BillingCreditGrantType;
    idempotencyKeyPrefix: string;
  }): Promise<number> {
    return this.billingCreditGrantRepository.count(workspaceId, {
      where: {
        type,
        revokedAt: IsNull(),
        sourceGrantId: IsNull(),
        idempotencyKey: Like(`${idempotencyKeyPrefix}%`),
      },
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
  }): Promise<BillingCreditGrantEntity> {
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
      return grant;
    }

    await this.billingCreditGrantRepository.update(
      workspaceId,
      { id: grantId, revokedAt: IsNull() },
      { revokedAt: new Date(), revokedByUserId: revokedByUserId ?? null },
    );

    return this.billingCreditGrantRepository.findOneOrFail(workspaceId, {
      where: { id: grantId },
    });
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
