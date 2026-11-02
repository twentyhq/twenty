/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type EntityManager, IsNull, type Repository } from 'typeorm';

import { BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { BillingArrangementLabel } from 'src/engine/core-modules/billing/enums/billing-arrangement-label.enum';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { buildBillingLimitOverrideLockKey } from 'src/engine/core-modules/billing/limit-override/utils/build-billing-limit-override-lock-key.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type CreateUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/create-usage-limit.input';
import { type UpdateUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/update-usage-limit.input';
import { UsageLimitService } from 'src/engine/core-modules/usage-limit/services/usage-limit.service';
import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const buildArrangementEndDateSql = (alias: string) =>
  `LEAST(COALESCE("${alias}"."revokedAt", 'infinity'), COALESCE("${alias}"."endsAt", 'infinity'))`;

@Injectable()
export class BillingLimitOverrideService {
  protected readonly logger = new Logger(BillingLimitOverrideService.name);

  constructor(
    @InjectWorkspaceScopedRepository(BillingArrangementEntity)
    private readonly billingArrangementRepository: WorkspaceScopedRepository<BillingArrangementEntity>,
    // Expired overrides are swept across every workspace
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(BillingArrangementEntity)
    private readonly allWorkspacesBillingArrangementRepository: Repository<BillingArrangementEntity>,
    private readonly usageLimitService: UsageLimitService,
    private readonly cacheLockService: CacheLockService,
  ) {}

  async create({
    workspaceId,
    input,
    grantedByUserId,
  }: {
    workspaceId: string;
    input: CreateUsageLimitInput;
    grantedByUserId: string;
  }): Promise<UsageLimitEntity> {
    return this.usageLimitService.create({
      workspaceId,
      input,
      isOperator: true,
      writeAlongside: (entityManager, usageLimit) =>
        this.insertLimitOverride({
          entityManager,
          workspaceId,
          usageLimitId: usageLimit.id,
          grantedByUserId,
        }),
    });
  }

  async replace({
    workspaceId,
    input,
    grantedByUserId,
  }: {
    workspaceId: string;
    input: UpdateUsageLimitInput;
    grantedByUserId: string;
  }): Promise<UsageLimitEntity> {
    return this.cacheLockService.withLock(
      () =>
        this.usageLimitService.update({
          workspaceId,
          input,
          isOperator: true,
          writeAlongside: async (entityManager, usageLimit) => {
            await this.endLimitOverrides({
              entityManager,
              workspaceId,
              usageLimitId: usageLimit.id,
              revokedByUserId: grantedByUserId,
            });

            await this.insertLimitOverride({
              entityManager,
              workspaceId,
              usageLimitId: usageLimit.id,
              grantedByUserId,
            });
          },
        }),
      buildBillingLimitOverrideLockKey(input.id),
    );
  }

  async end({
    workspaceId,
    usageLimitId,
    revokedByUserId,
  }: {
    workspaceId: string;
    usageLimitId: string;
    revokedByUserId: string;
  }): Promise<boolean> {
    return this.cacheLockService.withLock(
      () =>
        this.usageLimitService.delete({
          workspaceId,
          usageLimitId,
          isOperator: true,
          writeAlongside: (entityManager) =>
            this.endLimitOverrides({
              entityManager,
              workspaceId,
              usageLimitId,
              revokedByUserId,
            }),
        }),
      buildBillingLimitOverrideLockKey(usageLimitId),
    );
  }

  async deleteExpiredLimitOverrideRows(): Promise<void> {
    const expiredLimitOverrides =
      await this.allWorkspacesBillingArrangementRepository
        .createQueryBuilder('arrangement')
        .select('DISTINCT "arrangement"."workspaceId"', 'workspaceId')
        .addSelect('"arrangement"."usageLimitId"', 'usageLimitId')
        .innerJoin(
          UsageLimitEntity,
          'usageLimit',
          '"usageLimit"."id" = "arrangement"."usageLimitId"',
        )
        .where('"arrangement"."type" = :type', {
          type: BillingArrangementType.LIMIT_OVERRIDE,
        })
        .andWhere(`${buildArrangementEndDateSql('arrangement')} <= now()`)
        .andWhere(
          `NOT EXISTS (SELECT 1 FROM "core"."billingArrangement" "activeArrangement" WHERE "activeArrangement"."usageLimitId" = "arrangement"."usageLimitId" AND ${buildArrangementEndDateSql('activeArrangement')} > now())`,
        )
        .getRawMany<{ workspaceId: string; usageLimitId: string }>();

    for (const { workspaceId, usageLimitId } of expiredLimitOverrides) {
      try {
        await this.cacheLockService.withLock(
          () =>
            this.deleteUsageLimitWithoutActiveLimitOverride({
              workspaceId,
              usageLimitId,
            }),
          buildBillingLimitOverrideLockKey(usageLimitId),
        );
      } catch (error) {
        this.logger.error(
          `Could not delete the expired limit override ${usageLimitId} of workspace ${workspaceId}`,
          error,
        );
      }
    }
  }

  private async deleteUsageLimitWithoutActiveLimitOverride({
    workspaceId,
    usageLimitId,
  }: {
    workspaceId: string;
    usageLimitId: string;
  }): Promise<void> {
    const hasActiveLimitOverride = await this.billingArrangementRepository
      .createScopedQueryBuilder(workspaceId, 'arrangement')
      .andWhere('"arrangement"."type" = :type', {
        type: BillingArrangementType.LIMIT_OVERRIDE,
      })
      .andWhere('"arrangement"."usageLimitId" = :usageLimitId', {
        usageLimitId,
      })
      .andWhere(`${buildArrangementEndDateSql('arrangement')} > now()`)
      .getExists();

    if (hasActiveLimitOverride) {
      return;
    }

    await this.usageLimitService.delete({
      workspaceId,
      usageLimitId,
      isOperator: true,
    });
  }

  private async insertLimitOverride({
    entityManager,
    workspaceId,
    usageLimitId,
    grantedByUserId,
  }: {
    entityManager: EntityManager;
    workspaceId: string;
    usageLimitId: string;
    grantedByUserId: string;
  }): Promise<void> {
    await this.billingArrangementRepository
      .withManager(entityManager)
      .insert(workspaceId, {
        workspaceId,
        type: BillingArrangementType.LIMIT_OVERRIDE,
        label: BillingArrangementLabel.OTHER,
        comment: null,
        usageLimitId,
        startsAt: new Date(),
        endsAt: null,
        grantedByUserId,
      });
  }

  private async endLimitOverrides({
    entityManager,
    workspaceId,
    usageLimitId,
    revokedByUserId,
  }: {
    entityManager: EntityManager;
    workspaceId: string;
    usageLimitId: string;
    revokedByUserId: string;
  }): Promise<void> {
    await this.billingArrangementRepository.withManager(entityManager).update(
      workspaceId,
      {
        type: BillingArrangementType.LIMIT_OVERRIDE,
        usageLimitId,
        revokedAt: IsNull(),
      },
      { revokedAt: new Date(), revokedByUserId },
    );
  }
}
