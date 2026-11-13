/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { type EntityManager, IsNull } from 'typeorm';

import { BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { BillingArrangementLabel } from 'src/engine/core-modules/billing/enums/billing-arrangement-label.enum';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { BillingArrangementService } from 'src/engine/core-modules/billing/services/billing-arrangement.service';
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
    const isBillingEnabled = this.twentyConfigService.get('IS_BILLING_ENABLED');
    const startsAt = new Date();

    if (isDefined(endsAt) && !isBillingEnabled) {
      throw new UsageLimitException(
        'A limit override can only have an end date when billing is enabled',
        UsageLimitExceptionCode.LIMIT_INVALID,
      );
    }

    if (isDefined(endsAt) && endsAt <= startsAt) {
      throw new UsageLimitException(
        'A limit override must end in the future',
        UsageLimitExceptionCode.LIMIT_INVALID,
      );
    }

    if (!isBillingEnabled) {
      return this.usageLimitService.create({
        workspaceId,
        input,
        isOperator: true,
      });
    }

    return this.usageLimitService.create({
      workspaceId,
      input,
      isOperator: true,
      writeAlongside: async ({ entityManager, usageLimit }) => {
        await this.billingArrangementService.insertArrangement({
          workspaceId,
          arrangement: {
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
          entityManager,
        });
      },
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
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return this.usageLimitService.delete({
        workspaceId,
        usageLimitId,
        isOperator: true,
      });
    }

    return this.usageLimitService.delete({
      workspaceId,
      usageLimitId,
      isOperator: true,
      writeAlongside: ({ entityManager }) =>
        this.endLimitOverrides({
          entityManager,
          workspaceId,
          usageLimitId,
          revokedByUserId,
        }),
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
