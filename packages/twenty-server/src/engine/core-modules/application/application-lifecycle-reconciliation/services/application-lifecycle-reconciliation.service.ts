import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, LessThan, Repository } from 'typeorm';

import {
  APPLICATION_LIFECYCLE_RECONCILIATION_BATCH_SIZE,
  APPLICATION_LIFECYCLE_STUCK_AFTER_MINUTES,
} from 'src/engine/core-modules/application/application-lifecycle-reconciliation/constants/application-lifecycle-reconciliation.constant';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationOperation } from 'src/engine/core-modules/application/enums/application-operation.enum';
import { ApplicationState } from 'src/engine/core-modules/application/enums/application-state.enum';

const TRANSITIONAL_STATES = [
  ApplicationState.INSTALLING,
  ApplicationState.UPGRADING,
  ApplicationState.UNINSTALLING,
];

const RECONCILIATION_BY_STATE = {
  [ApplicationState.INSTALLING]: {
    operation: ApplicationOperation.INSTALL,
    nextState: ApplicationState.FAILED,
  },
  [ApplicationState.UPGRADING]: {
    operation: ApplicationOperation.UPGRADE,
    nextState: ApplicationState.INSTALLED,
  },
  [ApplicationState.UNINSTALLING]: {
    operation: ApplicationOperation.UNINSTALL,
    nextState: ApplicationState.INSTALLED,
  },
} as const;

type ReconcilableState = keyof typeof RECONCILIATION_BY_STATE;

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
    const { operation, nextState } =
      RECONCILIATION_BY_STATE[application.state as ReconcilableState];

    try {
      // Gated on the state that was read, so an operation that completed
      // between the read and this write is never overwritten.
      await this.applicationService.transitionState({
        applicationId: application.id,
        universalIdentifier: application.universalIdentifier,
        workspaceId: application.workspaceId,
        expectedState: application.state,
        nextState,
        failure: {
          operation,
          reason: `The ${operation.toLowerCase()} did not complete within ${APPLICATION_LIFECYCLE_STUCK_AFTER_MINUTES} minutes and was marked as failed.`,
        },
      });

      this.logger.warn(
        `Reconciled application ${application.universalIdentifier} in workspace ${application.workspaceId} from ${application.state} to ${nextState}`,
      );

      return true;
    } catch {
      return false;
    }
  }
}
