import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, LessThan, Repository } from 'typeorm';

import {
  APPLICATION_LIFECYCLE_RECONCILIATION_BATCH_SIZE,
  APPLICATION_LIFECYCLE_STUCK_AFTER_MINUTES,
} from 'src/engine/core-modules/application/application-lifecycle-reconciliation/constants/application-lifecycle-reconciliation.constant';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationState } from 'src/engine/core-modules/application/enums/application-state.enum';

const TRANSITIONAL_STATES = [
  ApplicationState.INSTALLING,
  ApplicationState.UPGRADING,
  ApplicationState.UNINSTALLING,
];

@Injectable()
export class ApplicationLifecycleReconciliationService {
  private readonly logger = new Logger(
    ApplicationLifecycleReconciliationService.name,
  );

  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly applicationService: ApplicationService,
  ) {}

  async reconcileStuckApplications(): Promise<number> {
    const stuckSince = new Date(
      Date.now() - APPLICATION_LIFECYCLE_STUCK_AFTER_MINUTES * 60 * 1000,
    );

    const stuckApplications = await this.applicationRepository.find({
      where: {
        state: In(TRANSITIONAL_STATES),
        updatedAt: LessThan(stuckSince),
      },
      take: APPLICATION_LIFECYCLE_RECONCILIATION_BATCH_SIZE,
      order: { updatedAt: 'ASC' },
    });

    let reconciledCount = 0;

    for (const application of stuckApplications) {
      const isReconciled = await this.reconcileApplication(application);

      if (isReconciled) {
        reconciledCount++;
      }
    }

    return reconciledCount;
  }

  private async reconcileApplication(
    application: ApplicationEntity,
  ): Promise<boolean> {
    try {
      if (application.state === ApplicationState.INSTALLING) {
        // An install that never completed leaves no application behind, so the
        // placeholder goes rather than surviving as a half-installed row.
        await this.applicationService.delete(
          application.universalIdentifier,
          application.workspaceId,
        );
      } else {
        // Gated on the state that was read, so an operation that completed
        // between the read and this write is never overwritten.
        await this.applicationService.transitionState({
          applicationId: application.id,
          universalIdentifier: application.universalIdentifier,
          workspaceId: application.workspaceId,
          expectedState: application.state,
          nextState: ApplicationState.INSTALLED,
        });
      }

      this.logger.warn(
        `Reconciled application ${application.universalIdentifier} in workspace ${application.workspaceId} stuck in ${application.state}`,
      );

      return true;
    } catch {
      return false;
    }
  }
}
