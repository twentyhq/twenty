/* @license Enterprise */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, LessThan, Repository } from 'typeorm';

import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

// Workspaces created less than 1 minute ago are excluded from the check
const WORKSPACE_AGE_THRESHOLD_MS = 60 * 1000;

@Injectable()
export class BillingGaugeService implements OnModuleInit {
  private readonly logger = new Logger(BillingGaugeService.name);

  constructor(
    private readonly metricsService: MetricsService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: Repository<BillingSubscriptionEntity>,
  ) {}

  onModuleInit() {
    this.metricsService.createObservableGauge({
      metricName: 'twenty_billing_subscribed_workspaces_total',
      options: {
        description: 'Total number of workspaces having an active subscription',
      },
      callback: async () => {
        return this.getSubscribedWorkspacesCount();
      },
      cacheValue: true,
    });

    this.metricsService.createObservableGauge({
      metricName: 'twenty_billing_last_workspace_has_subscription',
      options: {
        description:
          'Whether the last workspace (older than 1 min) has a subscription (1 = yes, 0 = no)',
      },
      callback: async () => {
        return this.lastWorkspaceHasSubscription();
      },
      cacheValue: true,
    });
  }

  private async getSubscribedWorkspacesCount(): Promise<number> {
    const isBillingEnabled = this.twentyConfigService.get('IS_BILLING_ENABLED');

    if (!isBillingEnabled) {
      return 0;
    }

    try {
      return this.billingSubscriptionRepository.count({
        where: { deletedAt: IsNull() },
      });
    } catch (error) {
      this.logger.error('Failed to count subscribed workspaces', error);

      return 0;
    }
  }

  private async lastWorkspaceHasSubscription(): Promise<number> {
    const isBillingEnabled = this.twentyConfigService.get('IS_BILLING_ENABLED');

    if (!isBillingEnabled) {
      return 1;
    }

    try {
      const ageThreshold = new Date(Date.now() - WORKSPACE_AGE_THRESHOLD_MS);

      // Find the most recently created workspace that is older than 1 minute
      const lastWorkspace = await this.workspaceRepository.findOne({
        where: {
          deletedAt: IsNull(),
          createdAt: LessThan(ageThreshold),
        },
        order: { createdAt: 'DESC' },
      });

      if (!lastWorkspace) {
        return 1;
      }

      const subscription = await this.billingSubscriptionRepository.findOne({
        where: {
          workspaceId: lastWorkspace.id,
          deletedAt: IsNull(),
        },
      });

      if (!subscription) {
        this.logger.warn(
          `Billing issue: workspace ${lastWorkspace.id} has no subscription`,
        );

        return 0;
      }

      return 1;
    } catch (error) {
      this.logger.error('Failed to check last workspace subscription', error);

      return 0;
    }
  }
}
