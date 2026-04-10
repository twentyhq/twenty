import { Injectable } from '@nestjs/common';

import { UPGRADE_COMMAND_SUPPORTED_VERSIONS } from 'src/engine/constants/upgrade-command-supported-versions.constant';
import {
  type RegisteredFastInstanceCommand,
  type RegisteredSlowInstanceCommand,
  type RegisteredWorkspaceCommand,
  UpgradeCommandRegistryService,
} from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';

export type InstanceSegment = {
  kind: 'instance';
  fastInstanceSteps: RegisteredFastInstanceCommand[];
  slowInstanceSteps: RegisteredSlowInstanceCommand[];
};

export type WorkspaceSegment = {
  kind: 'workspace';
  steps: RegisteredWorkspaceCommand[];
};

export type TapeSegment = InstanceSegment | WorkspaceSegment;

@Injectable()
export class UpgradeTapeReaderService {
  constructor(
    private readonly upgradeCommandRegistryService: UpgradeCommandRegistryService,
  ) {}

  getUpgradeTape(): TapeSegment[] {
    const segments: TapeSegment[] = [];

    for (const version of UPGRADE_COMMAND_SUPPORTED_VERSIONS) {
      const bundle =
        this.upgradeCommandRegistryService.getBundleForVersion(version);

      const hasInstanceSteps =
        bundle.fastInstanceCommands.length > 0 ||
        bundle.slowInstanceCommands.length > 0;

      if (hasInstanceSteps) {
        const lastSegment = segments[segments.length - 1];

        if (lastSegment?.kind === 'instance') {
          lastSegment.fastInstanceSteps.push(
            ...bundle.fastInstanceCommands,
          );
          lastSegment.slowInstanceSteps.push(
            ...bundle.slowInstanceCommands,
          );
        } else {
          segments.push({
            kind: 'instance',
            fastInstanceSteps: [...bundle.fastInstanceCommands],
            slowInstanceSteps: [...bundle.slowInstanceCommands],
          });
        }
      }

      if (bundle.workspaceCommands.length > 0) {
        const lastSegment = segments[segments.length - 1];

        if (lastSegment?.kind === 'workspace') {
          lastSegment.steps.push(...bundle.workspaceCommands);
        } else {
          segments.push({
            kind: 'workspace',
            steps: [...bundle.workspaceCommands],
          });
        }
      }
    }

    return segments;
  }

  getLastWorkspaceCommand(): RegisteredWorkspaceCommand {
    const segments = this.getUpgradeTape();

    for (let index = segments.length - 1; index >= 0; index--) {
      const segment = segments[index];

      if (segment.kind === 'workspace') {
        return segment.steps[segment.steps.length - 1];
      }
    }

    throw new Error(
      'No workspace commands found in upgrade tape — this should have been caught at startup',
    );
  }
}
