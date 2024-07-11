import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import {
  BillingSubscription,
  SubscriptionStatus,
} from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';

@Injectable()
export class BillingService {
  protected readonly logger = new Logger(BillingService.name);
  constructor(
    private readonly environmentService: EnvironmentService,
    @InjectRepository(BillingSubscription, 'core')
    private readonly billingSubscriptionRepository: Repository<BillingSubscription>,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  async getActiveSubscriptionWorkspaceIds() {
    if (!this.environmentService.get('IS_BILLING_ENABLED')) {
      return (await this.workspaceRepository.find({ select: ['id'] })).map(
        (workspace) => workspace.id,
      );
    }

    const activeSubscriptions = await this.billingSubscriptionRepository.find({
      where: {
        status: In([
          SubscriptionStatus.Active,
          SubscriptionStatus.Trialing,
          SubscriptionStatus.PastDue,
        ]),
      },
      select: ['workspaceId'],
    });

    const freeAccessFeatureFlags = await this.featureFlagRepository.find({
      where: {
        key: FeatureFlagKeys.IsFreeAccessEnabled,
        value: true,
      },
      select: ['workspaceId'],
    });

    const activeWorkspaceIdsBasedOnSubscriptions = activeSubscriptions.map(
      (subscription) => subscription.workspaceId,
    );

    const activeWorkspaceIdsBasedOnFeatureFlags = freeAccessFeatureFlags.map(
      (featureFlag) => featureFlag.workspaceId,
    );

    return Array.from(
      new Set([
        ...activeWorkspaceIdsBasedOnSubscriptions,
        ...activeWorkspaceIdsBasedOnFeatureFlags,
      ]),
    );
  }
}
