import { Injectable } from '@nestjs/common';

import { UPGRADE_COMMAND_SUPPORTED_VERSIONS } from 'src/engine/constants/upgrade-command-supported-versions.constant';
import {
  type RegisteredFastInstanceCommand,
  type RegisteredSlowInstanceCommand,
  type RegisteredWorkspaceCommand,
  UpgradeCommandRegistryService,
} from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';

export type WorkspaceTapeStep = {
  kind: 'workspace';
} & RegisteredWorkspaceCommand;

export type TapeStep =
  | ({ kind: 'fast-instance' } & RegisteredFastInstanceCommand)
  | ({ kind: 'slow-instance' } & RegisteredSlowInstanceCommand)
  | WorkspaceTapeStep;

@Injectable()
export class UpgradeTapeReaderService {
  constructor(
    private readonly upgradeCommandRegistryService: UpgradeCommandRegistryService,
  ) {}

  getUpgradeTape(): TapeStep[] {
    const tape: TapeStep[] = [];

    for (const version of UPGRADE_COMMAND_SUPPORTED_VERSIONS) {
      const bundle =
        this.upgradeCommandRegistryService.getBundleForVersion(version);

      for (const command of bundle.fastInstanceCommands) {
        tape.push({ kind: 'fast-instance', ...command });
      }

      for (const command of bundle.slowInstanceCommands) {
        tape.push({ kind: 'slow-instance', ...command });
      }

      for (const command of bundle.workspaceCommands) {
        tape.push({ kind: 'workspace', ...command });
      }
    }

    return tape;
  }

  locateCommandInTape(tape: TapeStep[], commandName: string): number {
    return tape.findIndex((step) => step.name === commandName);
  }

  collectContiguousWorkspaceCommands(
    tape: TapeStep[],
    fromIndex: number,
  ): WorkspaceTapeStep[] {
    const slice: WorkspaceTapeStep[] = [];

    for (let index = fromIndex; index < tape.length; index++) {
      const step = tape[index];

      if (step.kind !== 'workspace') {
        break;
      }

      slice.push(step);
    }

    return slice;
  }

  getLastWorkspaceCommand(): RegisteredWorkspaceCommand {
    const tape = this.getUpgradeTape();

    for (let index = tape.length - 1; index >= 0; index--) {
      const step = tape[index];

      if (step.kind === 'workspace') {
        return step;
      }
    }

    throw new Error(
      'No workspace commands found in upgrade tape — this should have been caught at startup',
    );
  }
}
