import { Injectable, Logger } from '@nestjs/common';

import {
  type WorkspaceIteratorReport,
  type WorkspaceIteratorService,
} from 'src/database/commands/command-runners/workspace-iterator.service';
import { type UpgradeCommandOptions } from 'src/database/commands/upgrade-version-command/upgrade.command';
import { InstanceUpgradeService } from 'src/engine/core-modules/upgrade/services/instance-upgrade.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import {
  type TapeStep,
  type WorkspaceTapeStep,
  UpgradeTapeReaderService,
} from 'src/engine/core-modules/upgrade/services/upgrade-tape-reader.service';
import { WorkspaceUpgradeService } from 'src/engine/core-modules/upgrade/services/workspace-upgrade.service';

export type UpgradeTapeRunnerReport = {
  totalSuccesses: number;
  totalFailures: number;
};

@Injectable()
export class UpgradeTapeRunnerService {
  private readonly logger = new Logger(UpgradeTapeRunnerService.name);

  constructor(
    private readonly upgradeMigrationService: UpgradeMigrationService,
    private readonly instanceUpgradeService: InstanceUpgradeService,
    private readonly workspaceUpgradeService: WorkspaceUpgradeService,
    private readonly upgradeTapeReaderService: UpgradeTapeReaderService,
  ) {}

  async run({
    tape,
    activeWorkspaceIds,
    options,
    workspaceIteratorService,
  }: {
    tape: TapeStep[];
    activeWorkspaceIds: string[];
    options: UpgradeCommandOptions;
    workspaceIteratorService: WorkspaceIteratorService;
  }): Promise<UpgradeTapeRunnerReport> {
    if (tape.length === 0) {
      return { totalSuccesses: 0, totalFailures: 0 };
    }

    const hasWorkspaces = activeWorkspaceIds.length > 0;
    const startIndex = await this.resolveStartIndex(tape, activeWorkspaceIds);

    let totalSuccesses = 0;
    let totalFailures = 0;
    let index = startIndex;

    while (index < tape.length) {
      const step = tape[index];
      const previousStep = index > 0 ? tape[index - 1] : undefined;

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
        this.upgradeTapeReaderService.collectContiguousWorkspaceCommands(
          tape,
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
    tape: TapeStep[],
    activeWorkspaceIds: string[],
  ): Promise<number> {
    const lastCompletedName =
      await this.upgradeMigrationService.getLastCompletedCommandNameOrThrow();

    const cursorIndex = this.upgradeTapeReaderService.locateCommandInTape(
      tape,
      lastCompletedName,
    );

    if (cursorIndex === -1) {
      throw new Error(
        `Cursor "${lastCompletedName}" not found in upgrade tape — ` +
          'the supported version sequence may have been broken',
      );
    }

    const cursorStep = tape[cursorIndex];

    if (cursorStep.kind === 'workspace' && activeWorkspaceIds.length > 0) {
      await this.validateWorkspaceCursorsAlignment(
        tape,
        activeWorkspaceIds,
        cursorIndex,
      );
    }

    return cursorIndex;
  }

  private async validateWorkspaceCursorsAlignment(
    tape: TapeStep[],
    activeWorkspaceIds: string[],
    expectedCursorIndex: number,
  ): Promise<void> {
    const workspaceCursors =
      await this.upgradeMigrationService.getWorkspaceCursorsOrThrow(
        activeWorkspaceIds,
      );

    for (const [workspaceId, cursorName] of workspaceCursors) {
      const location = this.upgradeTapeReaderService.locateCommandInTape(
        tape,
        cursorName,
      );

      if (location === -1) {
        throw new Error(
          `Workspace ${workspaceId} cursor "${cursorName}" not found in upgrade tape`,
        );
      }

      if (tape[location].kind !== 'workspace') {
        throw new Error(
          `Workspace ${workspaceId} cursor "${cursorName}" points to an instance command`,
        );
      }

      if (location > expectedCursorIndex) {
        throw new Error(
          `Workspace ${workspaceId} cursor "${cursorName}" is ahead of the ` +
            'global cursor — workspaces are not aligned',
        );
      }
    }
  }

  private async runInstanceStep(
    step: TapeStep,
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
    workspaceCommands: WorkspaceTapeStep[];
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
