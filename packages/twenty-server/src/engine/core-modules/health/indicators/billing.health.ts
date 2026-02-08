import { Injectable } from '@nestjs/common';
import {
  type HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { HealthStateManager } from 'src/engine/core-modules/health/utils/health-state-manager.util';
import { withHealthCheckTimeout } from 'src/engine/core-modules/health/utils/health-check-timeout.util';
import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';

@Injectable()
export class BillingHealthIndicator {
  private stateManager = new HealthStateManager();

  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: Repository<BillingSubscriptionEntity>,
  ) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('billing');

    try {
      const [lastWorkspace, totalWorkspaces, totalSubscriptions] =
        await withHealthCheckTimeout(
          Promise.all([
            this.workspaceRepository.findOne({
              where: {
                deletedAt: undefined,
              },
              order: {
                createdAt: 'DESC',
              },
            }),
            this.workspaceRepository.count({
              where: {
                deletedAt: undefined,
              },
            }),
            this.billingSubscriptionRepository.count({
              where: {
                deletedAt: undefined,
              },
            }),
          ]),
          HEALTH_ERROR_MESSAGES.BILLING_INFO_FAILED,
        );

      const checks: {
        passed: boolean;
        message: string;
        workspaceId?: string;
        workspaceCreatedAt?: Date;
      }[] = [];

      if (lastWorkspace) {
        const workspaceAge = Date.now() - lastWorkspace.createdAt.getTime();
        const isOldEnough = workspaceAge > 5 * 60 * 1000;

        if (isOldEnough) {
          const subscription = await this.billingSubscriptionRepository.findOne(
            {
              where: {
                workspaceId: lastWorkspace.id,
              },
            },
          );

          const hasSubscription = !!subscription;

          checks.push({
            passed: hasSubscription,
            message: hasSubscription
              ? 'Last workspace has subscription'
              : 'Last workspace missing subscription',
            workspaceId: lastWorkspace.id,
            workspaceCreatedAt: lastWorkspace.createdAt,
          });

          if (!hasSubscription) {
            const errorDetails = {
              system: {
                timestamp: new Date().toISOString(),
              },
              checks,
              statistics: {
                totalWorkspaces,
                totalSubscriptions,
              },
              failedWorkspace: {
                id: lastWorkspace.id,
                createdAt: lastWorkspace.createdAt,
                ageInMinutes: Math.floor(workspaceAge / 60000),
              },
            };

            this.stateManager.updateState(errorDetails);

            return indicator.down({
              message: `Billing issue detected: Workspace ${lastWorkspace.id} created ${Math.floor(workspaceAge / 60000)} minutes ago has no subscription`,
              details: errorDetails,
            });
          }
        }
      }

      const details = {
        system: {
          timestamp: new Date().toISOString(),
        },
        checks,
        statistics: {
          totalWorkspaces,
          totalSubscriptions,
          subscriptionCoverage:
            totalWorkspaces > 0
              ? `${((totalSubscriptions / totalWorkspaces) * 100).toFixed(2)}%`
              : 'N/A',
        },
      };

      this.stateManager.updateState(details);

      return indicator.up({ details });
    } catch (error) {
      const stateWithAge = this.stateManager.getStateWithAge();

      return indicator.down({
        message: error.message,
        details: {
          system: {
            timestamp: new Date().toISOString(),
          },
          error: error.message,
          stateHistory: stateWithAge,
        },
      });
    }
  }
}
