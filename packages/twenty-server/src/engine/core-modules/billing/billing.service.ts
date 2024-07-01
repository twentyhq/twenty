import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class BillingService {
  protected readonly logger = new Logger(BillingService.name);
  constructor(
    private readonly environmentService: EnvironmentService,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  async getActiveSubscriptionWorkspaceIds() {
    return (
      await this.workspaceRepository.find({
        where: this.environmentService.get('IS_BILLING_ENABLED')
          ? {
              currentBillingSubscription: {
                status: In([
                  SubscriptionStatus.Active,
                  SubscriptionStatus.Trialing,
                  SubscriptionStatus.PastDue,
                ]),
              },
            }
          : {},
        select: ['id'],
      })
    ).map((workspace) => workspace.id);
  }
}
