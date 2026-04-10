import { Injectable, Logger } from '@nestjs/common';

import {
  type WorkspaceIteratorReport,
  type WorkspaceIteratorService,
} from 'src/database/commands/command-runners/workspace-iterator.service';
import { type UpgradeCommandOptions } from 'src/database/commands/upgrade-version-command/upgrade.command';
import { InstanceUpgradeService } from 'src/engine/core-modules/upgrade/services/instance-upgrade.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import {
  type UpgradeStep,
  type WorkspaceUpgradeStep,
  UpgradeSequenceReaderService,
} from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { WorkspaceUpgradeService } from 'src/engine/core-modules/upgrade/services/workspace-upgrade.service';

export type UpgradeSequenceRunnerReport = {
  totalSuccesses: number;
  totalFailures: number;
};

@Injectable()
export class UpgradeSequenceRunnerService {
  private readonly logger = new Logger(UpgradeSequenceRunnerService.name);

  constructor(
    private readonly upgradeMigrationService: UpgradeMigrationService,
    private readonly instanceUpgradeService: InstanceUpgradeService,
    private readonly workspaceUpgradeService: WorkspaceUpgradeService,
    private readonly upgradeSequenceReaderService: UpgradeSequenceReaderService,
  ) {}

  async run({
    sequence,
    activeWorkspaceIds,
    options,
    workspaceIteratorService,
  }: {
    sequence: UpgradeStep[];
    activeWorkspaceIds: string[];
    options: UpgradeCommandOptions;
    workspaceIteratorService: WorkspaceIteratorService;
  }): Promise<UpgradeSequenceRunnerReport> {
    if (sequence.length === 0) {
      return { totalSuccesses: 0, totalFailures: 0 };
    }

    const hasWorkspaces = activeWorkspaceIds.length > 0;
    const startIndex = await this.resolveStartIndex(
      sequence,
      activeWorkspaceIds,
    );

    let totalSuccesses = 0;
    let totalFailures = 0;
    let index = startIndex;

    while (index < sequence.length) {
      const step = sequence[index];
      const previousStep = index > 0 ? sequence[index - 1] : undefined;

      if (step.kind === 'fast-instance' || step.kind === 'slow-instance') {
        if (hasWorkspaces && previousStep?.kind === 'workspace') {
          await this.enforceWorkspaceSyncBarrier(
            previousStep.name,
            activeWorkspaceIds,
          );
        }

        await this.runInstanceStep(step, hasWorkspaces);
        index++;
        continue;
      }

      if (!hasWorkspaces) {
        this.logger.log(
          `No active workspaces, skipping workspace step ${step.name}`,
        );
        index++;
        continue;
      }

      const workspaceCommandsSlice =
        this.upgradeSequenceReaderService.collectContiguousWorkspaceSteps(
          sequence,
          index,
        );

      const report = await this.runWorkspaceCommandsSlice({
        workspaceCommands: workspaceCommandsSlice,
        options,
        workspaceIteratorService,
      });

      totalSuccesses += report.success.length;
      totalFailures += report.fail.length;

      if (report.fail.length > 0) {
        this.logger.error(
          `Workspace steps ended with ${report.fail.length} failure(s). ` +
            'Aborting — cannot proceed to next instance step.',
        );

        return { totalSuccesses, totalFailures };
      }

      index += workspaceCommandsSlice.length;
    }

    return { totalSuccesses, totalFailures };
  }

  private async resolveStartIndex(
    sequence: UpgradeStep[],
    activeWorkspaceIds: string[],
  ): Promise<number> {
    const lastCompletedName =
      await this.upgradeMigrationService.getLastCompletedCommandNameOrThrow();

    const cursorIndex =
      this.upgradeSequenceReaderService.locateCommandInSequenceOrThrow(
        sequence,
        lastCompletedName,
      );

    const cursorStep = sequence[cursorIndex];

    if (cursorStep.kind === 'workspace' && activeWorkspaceIds.length > 0) {
      await this.validateWorkspaceCursorsAlignment(
        sequence,
        activeWorkspaceIds,
        cursorIndex,
      );
    }

    return cursorIndex;
  }

  private async validateWorkspaceCursorsAlignment(
    sequence: UpgradeStep[],
    activeWorkspaceIds: string[],
    globalCursorIndex: number,
  ): Promise<void> {
    const { startIndex, endIndex } =
      this.upgradeSequenceReaderService.getWorkspaceSliceBounds(
        sequence,
        globalCursorIndex,
      );

    const workspaceCursors =
      await this.upgradeMigrationService.getWorkspaceCursorsOrThrow(
        activeWorkspaceIds,
      );

    for (const [workspaceId, cursorName] of workspaceCursors) {
      const location =
        this.upgradeSequenceReaderService.locateCommandInSequenceOrThrow(
          sequence,
          cursorName,
        );

      if (location < startIndex || location > endIndex) {
        throw new Error(
          `Workspace ${workspaceId} cursor "${cursorName}" is outside the ` +
            `current workspace slice [${startIndex}..${endIndex}] — ` +
            'workspaces are not aligned',
        );
      }
    }
  }

  private async runInstanceStep(
    step: UpgradeStep,
    hasWorkspaces: boolean,
  ): Promise<void> {
    if (step.kind === 'fast-instance') {
      const result = await this.instanceUpgradeService.runFastInstanceCommand({
        command: step.command,
        name: step.name,
      });

      if (result.status === 'failed') {
        throw result.error;
      }

      return;
    }

    if (step.kind === 'slow-instance') {
      const result = await this.instanceUpgradeService.runSlowInstanceCommand({
        command: step.command,
        name: step.name,
        skipDataMigration: !hasWorkspaces,
      });

      if (result.status === 'failed') {
        throw result.error;
      }
    }
  }

  private async runWorkspaceCommandsSlice({
    workspaceCommands,
    options,
    workspaceIteratorService,
  }: {
    workspaceCommands: WorkspaceUpgradeStep[];
    options: UpgradeCommandOptions;
    workspaceIteratorService: WorkspaceIteratorService;
  }): Promise<WorkspaceIteratorReport> {
    return workspaceIteratorService.iterate({
      workspaceIds:
        options.workspaceId && options.workspaceId.size > 0
          ? Array.from(options.workspaceId)
          : undefined,
      startFromWorkspaceId: options.startFromWorkspaceId,
      workspaceCountLimit: options.workspaceCountLimit,
      dryRun: options.dryRun,
      callback: async (context) => {
        await this.workspaceUpgradeService.runWorkspaceCommands({
          iteratorContext: context,
          options,
          workspaceCommands,
        });
      },
    });
  }

  private async enforceWorkspaceSyncBarrier(
    lastWorkspaceCommandName: string,
    activeWorkspaceIds: string[],
  ): Promise<void> {
    const allWorkspacesReady =
      await this.upgradeMigrationService.areAllWorkspacesAtCommand({
        commandName: lastWorkspaceCommandName,
        workspaceIds: activeWorkspaceIds,
      });

    if (!allWorkspacesReady) {
      throw new Error(
        'Cannot run instance step: not all workspaces have completed ' +
          `"${lastWorkspaceCommandName}"`,
      );
    }
  }
}
