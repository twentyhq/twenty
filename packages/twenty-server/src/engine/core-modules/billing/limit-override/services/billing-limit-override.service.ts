/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { type EntityManager, IsNull } from 'typeorm';

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
  constructor(
    @InjectWorkspaceScopedRepository(BillingArrangementEntity)
    private readonly billingArrangementRepository: WorkspaceScopedRepository<BillingArrangementEntity>,
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
