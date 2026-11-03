/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { type EntityManager, IsNull } from 'typeorm';

import { BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { BillingArrangementLabel } from 'src/engine/core-modules/billing/enums/billing-arrangement-label.enum';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { BillingArrangementService } from 'src/engine/core-modules/billing/services/billing-arrangement.service';
import { type BillingArrangementDraft } from 'src/engine/core-modules/billing/types/billing-arrangement-draft.type';
import { getBillingArrangementValidationErrors } from 'src/engine/core-modules/billing/utils/get-billing-arrangement-validation-errors.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
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
    private readonly billingArrangementService: BillingArrangementService,
    private readonly usageLimitService: UsageLimitService,
    private readonly twentyConfigService: TwentyConfigService,
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
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      if (isDefined(endsAt)) {
        throw new UsageLimitException(
          'A limit override can only have an end date when billing is enabled',
          UsageLimitExceptionCode.LIMIT_INVALID,
        );
      }

      return this.usageLimitService.create({
        workspaceId,
        input,
        isOperator: true,
      });
    }

    const startsAt = new Date();

    return this.usageLimitService.create({
      workspaceId,
      input,
      isOperator: true,
      writeAlongside: (entityManager, usageLimit) =>
        this.insertLimitOverride({
          entityManager,
          workspaceId,
          limitOverride: {
            type: BillingArrangementType.LIMIT_OVERRIDE,
            label: BillingArrangementLabel.OTHER,
            comment: null,
            seats: null,
            seatCapMode: null,
            stripePriceId: null,
            stripeDiscountId: null,
            creditAllowanceMicro: null,
            stripeCreditNoteId: null,
            creditGrantId: null,
            usageLimitId: usageLimit.id,
            startsAt,
            endsAt,
          },
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
      writeAlongside: this.twentyConfigService.get('IS_BILLING_ENABLED')
        ? (entityManager) =>
            this.endLimitOverrides({
              entityManager,
              workspaceId,
              usageLimitId,
              revokedByUserId,
            })
        : undefined,
    });
  }

  private async insertLimitOverride({
    entityManager,
    workspaceId,
    limitOverride,
    grantedByUserId,
  }: {
    entityManager: EntityManager;
    workspaceId: string;
    limitOverride: BillingArrangementDraft;
    grantedByUserId: string;
  }): Promise<void> {
    const validationErrors =
      getBillingArrangementValidationErrors(limitOverride);

    if (isNonEmptyArray(validationErrors)) {
      throw new UsageLimitException(
        `Invalid limit override: ${validationErrors.map(({ code }) => code).join(', ')}`,
        UsageLimitExceptionCode.LIMIT_INVALID,
      );
    }

    await this.billingArrangementService.insertArrangement({
      workspaceId,
      arrangement: limitOverride,
      grantedByUserId,
      entityManager,
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
