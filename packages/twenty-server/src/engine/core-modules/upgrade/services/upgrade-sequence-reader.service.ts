import { Injectable } from '@nestjs/common';

import { CROSS_UPGRADE_SUPPORTED_VERSIONS } from 'src/engine/core-modules/upgrade/constants/cross-upgrade-supported-version.constant';
import {
  type RegisteredFastInstanceCommand,
  type RegisteredSlowInstanceCommand,
  type RegisteredWorkspaceCommand,
  UpgradeCommandRegistryService,
} from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';

export type FastInstanceUpgradeStep = {
  kind: 'fast-instance';
} & RegisteredFastInstanceCommand;

export type SlowInstanceUpgradeStep = {
  kind: 'slow-instance';
} & RegisteredSlowInstanceCommand;

export type InstanceUpgradeStep =
  | FastInstanceUpgradeStep
  | SlowInstanceUpgradeStep;

export type WorkspaceUpgradeStep = {
  kind: 'workspace';
} & RegisteredWorkspaceCommand;

export type UpgradeStep = InstanceUpgradeStep | WorkspaceUpgradeStep;

@Injectable()
export class UpgradeSequenceReaderService {
  constructor(
    private readonly upgradeCommandRegistryService: UpgradeCommandRegistryService,
  ) {}

  getUpgradeSequence(): UpgradeStep[] {
    const sequence: UpgradeStep[] = [];

    for (const version of CROSS_UPGRADE_SUPPORTED_VERSIONS) {
      const bundle =
        this.upgradeCommandRegistryService.getBundleForVersion(version);

      for (const command of bundle.fastInstanceCommands) {
        sequence.push({ kind: 'fast-instance', ...command });
      }

      for (const command of bundle.slowInstanceCommands) {
        sequence.push({ kind: 'slow-instance', ...command });
      }

      for (const command of bundle.workspaceCommands) {
        sequence.push({ kind: 'workspace', ...command });
      }
    }

    return sequence;
  }

  locateStepInSequenceOrThrow({
    sequence,
    stepName,
  }: {
    sequence: UpgradeStep[];
    stepName: string;
  }): number {
    const cursor = sequence.findIndex((step) => step.name === stepName);

    if (cursor === -1) {
      throw new Error(`Step "${stepName}" not found in upgrade sequence`);
    }

    return cursor;
  }

  getWorkspaceCommandsSliceBounds({
    sequence,
    workspaceCommand,
  }: {
    sequence: UpgradeStep[];
    workspaceCommand: WorkspaceUpgradeStep;
  }): { startCursor: number; endCursor: number } {
    const workspaceCommandCursor = this.locateStepInSequenceOrThrow({
      sequence,
      stepName: workspaceCommand.name,
    });

    let startCursor = workspaceCommandCursor;

    while (startCursor > 0 && sequence[startCursor - 1].kind === 'workspace') {
      startCursor--;
    }

    let endCursor = workspaceCommandCursor;

    while (
      endCursor < sequence.length - 1 &&
      sequence[endCursor + 1].kind === 'workspace'
    ) {
      endCursor++;
    }

    return { startCursor, endCursor };
  }

  collectContiguousWorkspaceSteps({
    sequence,
    fromWorkspaceCommand,
  }: {
    sequence: UpgradeStep[];
    fromWorkspaceCommand: WorkspaceUpgradeStep;
  }): WorkspaceUpgradeStep[] {
    const fromCursor = this.locateStepInSequenceOrThrow({
      sequence,
      stepName: fromWorkspaceCommand.name,
    });

    const slice: WorkspaceUpgradeStep[] = [];

    for (let cursor = fromCursor; cursor < sequence.length; cursor++) {
      const step = sequence[cursor];

      if (step.kind !== 'workspace') {
        break;
      }

      slice.push(step);
    }

    return slice;
  }

  getPendingWorkspaceCommands({
    workspaceCommands,
    workspaceCursor,
  }: {
    workspaceCommands: WorkspaceUpgradeStep[];
    workspaceCursor: { name: string; status: 'completed' | 'failed' };
  }): WorkspaceUpgradeStep[] {
    const cursorIndex = workspaceCommands.findIndex(
      (command) => command.name === workspaceCursor.name,
    );

    if (cursorIndex === -1) {
      throw new Error(
        `Workspace cursor "${workspaceCursor.name}" not found in current workspace commands slice`,
      );
    }

    return workspaceCursor.status === 'completed'
      ? workspaceCommands.slice(cursorIndex + 1)
      : workspaceCommands.slice(cursorIndex);
  }

  getLastWorkspaceCommand(): RegisteredWorkspaceCommand {
    const sequence = this.getUpgradeSequence();

    for (let index = sequence.length - 1; index >= 0; index--) {
      const step = sequence[index];

      if (step.kind === 'workspace') {
        return step;
      }
    }

    throw new Error(
      'No workspace commands found in upgrade sequence — this should have been caught at startup',
    );
  }
}
