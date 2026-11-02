/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, type Repository } from 'typeorm';

import { BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { BillingArrangementLabel } from 'src/engine/core-modules/billing/enums/billing-arrangement-label.enum';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
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
    const usageLimit = await this.usageLimitService.create({
      workspaceId,
      input,
      isOperator: true,
    });

    try {
      await this.insertLimitOverride({
        workspaceId,
        usageLimitId: usageLimit.id,
        grantedByUserId,
      });
    } catch (error) {
      await this.usageLimitService.delete({
        workspaceId,
        usageLimitId: usageLimit.id,
        isOperator: true,
      });

      throw error;
    }

    return usageLimit;
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
    const usageLimit = await this.usageLimitService.update({
      workspaceId,
      input,
      isOperator: true,
    });

    await this.endLimitOverrides({
      workspaceId,
      usageLimitId: usageLimit.id,
      revokedByUserId: grantedByUserId,
    });

    await this.insertLimitOverride({
      workspaceId,
      usageLimitId: usageLimit.id,
      grantedByUserId,
    });

    return usageLimit;
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
    const isDeleted = await this.usageLimitService.delete({
      workspaceId,
      usageLimitId,
      isOperator: true,
    });

    await this.endLimitOverrides({
      workspaceId,
      usageLimitId,
      revokedByUserId,
    });

    return isDeleted;
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
        await this.usageLimitService.delete({
          workspaceId,
          usageLimitId,
          isOperator: true,
        });
      } catch (error) {
        this.logger.error(
          `Could not delete the expired limit override ${usageLimitId} of workspace ${workspaceId}`,
          error,
        );
      }
    }
  }

  private async insertLimitOverride({
    workspaceId,
    usageLimitId,
    grantedByUserId,
  }: {
    workspaceId: string;
    usageLimitId: string;
    grantedByUserId: string;
  }): Promise<void> {
    await this.billingArrangementRepository.insert(workspaceId, {
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
    workspaceId,
    usageLimitId,
    revokedByUserId,
  }: {
    workspaceId: string;
    usageLimitId: string;
    revokedByUserId: string;
  }): Promise<void> {
    await this.billingArrangementRepository.update(
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
