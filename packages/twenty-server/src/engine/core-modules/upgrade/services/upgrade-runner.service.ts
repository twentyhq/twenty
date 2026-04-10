import { Injectable, Logger } from '@nestjs/common';

import {
  type RegisteredFastInstanceCommand,
  type RegisteredSlowInstanceCommand,
  type RegisteredWorkspaceCommand,
  type TapeSegment,
  type WorkspaceSegment,
} from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';

type RunFastInstanceStep = (
  step: RegisteredFastInstanceCommand,
) => Promise<void>;

type RunSlowInstanceStep = (
  step: RegisteredSlowInstanceCommand,
) => Promise<void>;

type RunWorkspaceSegment = (
  steps: RegisteredWorkspaceCommand[],
) => Promise<WorkspaceSegmentReport>;

export type WorkspaceSegmentReport = {
  successes: number;
  failures: number;
};

@Injectable()
export class UpgradeRunnerService {
  private readonly logger = new Logger(UpgradeRunnerService.name);

  constructor(
    private readonly upgradeMigrationService: UpgradeMigrationService,
  ) {}

  async run({
    tape,
    activeWorkspaceIds,
    runFastInstanceStep,
    runSlowInstanceStep,
    runWorkspaceSegment,
  }: {
    tape: TapeSegment[];
    activeWorkspaceIds: string[];
    runFastInstanceStep: RunFastInstanceStep;
    runSlowInstanceStep: RunSlowInstanceStep;
    runWorkspaceSegment: RunWorkspaceSegment;
  }): Promise<{ totalSuccesses: number; totalFailures: number }> {
    const instanceCompletedNames =
      await this.upgradeMigrationService.getCompletedCommandNames(null);

    let totalSuccesses = 0;
    let totalFailures = 0;
    let previousWorkspaceSegment: WorkspaceSegment | undefined;

    for (const segment of tape) {
      if (segment.kind === 'instance') {
        const pendingFastSteps = segment.fastInstanceSteps.filter(
          (step) => !instanceCompletedNames.has(step.name),
        );

        const pendingSlowSteps = segment.slowInstanceSteps.filter(
          (step) => !instanceCompletedNames.has(step.name),
        );

        if (
          pendingFastSteps.length === 0 &&
          pendingSlowSteps.length === 0
        ) {
          continue;
        }

        if (
          activeWorkspaceIds.length > 0 &&
          previousWorkspaceSegment
        ) {
          const lastWorkspaceCommand =
            previousWorkspaceSegment.steps[
              previousWorkspaceSegment.steps.length - 1
            ];

          const allWorkspacesReady =
            await this.upgradeMigrationService.areAllWorkspacesAtCommand({
              commandName: lastWorkspaceCommand.name,
              workspaceIds: activeWorkspaceIds,
            });

          if (!allWorkspacesReady) {
            throw new Error(
              `Cannot run instance segment: not all workspaces have completed ` +
                `${lastWorkspaceCommand.name} [${lastWorkspaceCommand.version}]`,
            );
          }
        }

        for (const step of pendingFastSteps) {
          await runFastInstanceStep(step);
        }

        for (const step of pendingSlowSteps) {
          await runSlowInstanceStep(step);
        }
      }

      if (segment.kind === 'workspace') {
        previousWorkspaceSegment = segment;

        if (activeWorkspaceIds.length === 0) {
          this.logger.log(
            'No active workspaces, skipping workspace segment',
          );
          continue;
        }

        const report = await runWorkspaceSegment(segment.steps);

        totalSuccesses += report.successes;
        totalFailures += report.failures;

        if (report.failures > 0) {
          this.logger.error(
            `Workspace segment ended with ${report.failures} failure(s). ` +
              'Aborting — cannot proceed to next instance segment.',
          );

          return { totalSuccesses, totalFailures };
        }
      }
    }

    return { totalSuccesses, totalFailures };
  }
}
