import { Injectable } from '@nestjs/common';

import { UPGRADE_COMMAND_SUPPORTED_VERSIONS } from 'src/engine/constants/upgrade-command-supported-versions.constant';
import {
  type RegisteredFastInstanceCommand,
  type RegisteredSlowInstanceCommand,
  type RegisteredWorkspaceCommand,
  UpgradeCommandRegistryService,
} from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';

export type WorkspaceUpgradeStep = {
  kind: 'workspace';
} & RegisteredWorkspaceCommand;

export type UpgradeStep =
  | ({ kind: 'fast-instance' } & RegisteredFastInstanceCommand)
  | ({ kind: 'slow-instance' } & RegisteredSlowInstanceCommand)
  | WorkspaceUpgradeStep;

@Injectable()
export class UpgradeSequenceReaderService {
  constructor(
    private readonly upgradeCommandRegistryService: UpgradeCommandRegistryService,
  ) {}

  getUpgradeSequence(): UpgradeStep[] {
    const sequence: UpgradeStep[] = [];

    for (const version of UPGRADE_COMMAND_SUPPORTED_VERSIONS) {
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

  locateCommandInSequenceOrThrow(
    sequence: UpgradeStep[],
    commandName: string,
  ): number {
    const index = sequence.findIndex((step) => step.name === commandName);

    if (index === -1) {
      throw new Error(`Command "${commandName}" not found in upgrade sequence`);
    }

    return index;
  }

  getWorkspaceSliceBounds(
    sequence: UpgradeStep[],
    indexInSlice: number,
  ): { startIndex: number; endIndex: number } {
    let startIndex = indexInSlice;

    while (startIndex > 0 && sequence[startIndex - 1].kind === 'workspace') {
      startIndex--;
    }

    let endIndex = indexInSlice;

    while (
      endIndex < sequence.length - 1 &&
      sequence[endIndex + 1].kind === 'workspace'
    ) {
      endIndex++;
    }

    return { startIndex, endIndex };
  }

  collectContiguousWorkspaceSteps(
    sequence: UpgradeStep[],
    fromIndex: number,
  ): WorkspaceUpgradeStep[] {
    const slice: WorkspaceUpgradeStep[] = [];

    for (let index = fromIndex; index < sequence.length; index++) {
      const step = sequence[index];

      if (step.kind !== 'workspace') {
        break;
      }

      slice.push(step);
    }

    return slice;
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
