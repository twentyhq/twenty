/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type EntityManager, IsNull, type Repository } from 'typeorm';

import { BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { BillingArrangementLabel } from 'src/engine/core-modules/billing/enums/billing-arrangement-label.enum';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type CreateUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/create-usage-limit.input';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { UsageLimitService } from 'src/engine/core-modules/usage-limit/services/usage-limit.service';
import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

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
    endsAt,
    grantedByUserId,
  }: {
    workspaceId: string;
    input: CreateUsageLimitInput;
    endsAt: Date | null;
    grantedByUserId: string;
  }): Promise<UsageLimitEntity> {
    if (isDefined(endsAt) && endsAt <= new Date()) {
      throw new UsageLimitException(
        'A limit override must end in the future',
        UsageLimitExceptionCode.LIMIT_INVALID,
      );
    }

    return this.usageLimitService.create({
      workspaceId,
      input,
      isOperator: true,
      writeAlongside: (entityManager, usageLimit) =>
        this.insertLimitOverride({
          entityManager,
          workspaceId,
          usageLimitId: usageLimit.id,
          endsAt,
          grantedByUserId,
        }),
    });
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
    return this.usageLimitService.delete({
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
    });
  }

  async deleteExpiredLimitOverrideRows(): Promise<void> {
    const expiredLimitOverrides =
      await this.allWorkspacesBillingArrangementRepository
        .createQueryBuilder('arrangement')
        .select('"arrangement"."workspaceId"', 'workspaceId')
        .addSelect('"arrangement"."usageLimitId"', 'usageLimitId')
        .innerJoin(
          UsageLimitEntity,
          'usageLimit',
          '"usageLimit"."id" = "arrangement"."usageLimitId"',
        )
        .where('"arrangement"."type" = :type', {
          type: BillingArrangementType.LIMIT_OVERRIDE,
        })
        .andWhere('"arrangement"."endsAt" <= now()')
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
    entityManager,
    workspaceId,
    usageLimitId,
    endsAt,
    grantedByUserId,
  }: {
    entityManager: EntityManager;
    workspaceId: string;
    usageLimitId: string;
    endsAt: Date | null;
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
        endsAt,
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
