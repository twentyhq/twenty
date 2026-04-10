import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { type ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { type WorkspaceCommandRunner } from 'src/database/commands/command-runners/workspace.command-runner';
import { getRegisteredInstanceCommandMetadata } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { getRegisteredWorkspaceCommandMetadata } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import {
  UPGRADE_COMMAND_SUPPORTED_VERSIONS,
  type UpgradeCommandVersion,
} from 'src/engine/constants/upgrade-command-supported-versions.constant';
import { isDefined } from 'twenty-shared/utils';

type WorkspaceCommand =
  | WorkspaceCommandRunner
  | ActiveOrSuspendedWorkspaceCommandRunner;

export type RegisteredFastInstanceCommand = {
  name: string;
  command: FastInstanceCommand;
  version: UpgradeCommandVersion;
  timestamp: number;
};

export type RegisteredSlowInstanceCommand = {
  name: string;
  command: SlowInstanceCommand;
  version: UpgradeCommandVersion;
  timestamp: number;
};

export type RegisteredWorkspaceCommand = {
  name: string;
  command: WorkspaceCommand;
  version: UpgradeCommandVersion;
  timestamp: number;
};

type VersionBundle = {
  fastInstanceCommands: RegisteredFastInstanceCommand[];
  slowInstanceCommands: RegisteredSlowInstanceCommand[];
  workspaceCommands: RegisteredWorkspaceCommand[];
};

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

const buildEmptyVersionBundle = (): VersionBundle => ({
  fastInstanceCommands: [],
  slowInstanceCommands: [],
  workspaceCommands: [],
});

@Injectable()
export class UpgradeCommandRegistryService implements OnModuleInit {
  private readonly logger = new Logger(UpgradeCommandRegistryService.name);

  private readonly bundlesByVersion = new Map<
    UpgradeCommandVersion,
    VersionBundle
  >();

  constructor(private readonly discoveryService: DiscoveryService) {}

  onModuleInit(): void {
    for (const version of UPGRADE_COMMAND_SUPPORTED_VERSIONS) {
      this.bundlesByVersion.set(version, {
        fastInstanceCommands: [],
        slowInstanceCommands: [],
        workspaceCommands: [],
      });
    }

    const providers = this.discoveryService.getProviders();

    for (const wrapper of providers) {
      const { instance, metatype } = wrapper;

      if (!instance || !metatype) {
        continue;
      }

      const instanceCommandMetadata =
        getRegisteredInstanceCommandMetadata(metatype);

      if (isDefined(instanceCommandMetadata)) {
        const bundle = this.bundlesByVersion.get(
          instanceCommandMetadata.version,
        );

        if (isDefined(bundle)) {
          const entry = {
            name: this.computeCommandName(
              instanceCommandMetadata.version,
              (instance as FastInstanceCommand).constructor.name,
              instanceCommandMetadata.timestamp,
            ),
            version: instanceCommandMetadata.version,
            timestamp: instanceCommandMetadata.timestamp,
          };

          if (instanceCommandMetadata.type === 'slow') {
            bundle.slowInstanceCommands.push({
              ...entry,
              command: instance as SlowInstanceCommand,
            });
          } else {
            bundle.fastInstanceCommands.push({
              ...entry,
              command: instance as FastInstanceCommand,
            });
          }
        }

        continue;
      }

      const workspaceCommandMetadata =
        getRegisteredWorkspaceCommandMetadata(metatype);

      if (isDefined(workspaceCommandMetadata)) {
        const bundle = this.bundlesByVersion.get(
          workspaceCommandMetadata.version,
        );

        if (isDefined(bundle)) {
          bundle.workspaceCommands.push({
            name: this.computeCommandName(
              workspaceCommandMetadata.version,
              (instance as WorkspaceCommand).constructor.name,
              workspaceCommandMetadata.timestamp,
            ),
            command: instance as WorkspaceCommand,
            version: workspaceCommandMetadata.version,
            timestamp: workspaceCommandMetadata.timestamp,
          });
        }
      }
    }

    for (const [, bundle] of this.bundlesByVersion) {
      bundle.fastInstanceCommands.sort(
        (entryA, entryB) => entryA.timestamp - entryB.timestamp,
      );
      bundle.slowInstanceCommands.sort(
        (entryA, entryB) => entryA.timestamp - entryB.timestamp,
      );
      bundle.workspaceCommands.sort(
        (entryA, entryB) => entryA.timestamp - entryB.timestamp,
      );
    }

    this.validateNoDuplicates();

    for (const [version, bundle] of this.bundlesByVersion) {
      const totalCount =
        bundle.fastInstanceCommands.length +
        bundle.slowInstanceCommands.length +
        bundle.workspaceCommands.length;

      if (totalCount > 0) {
        this.logger.log(
          `Registered ${bundle.fastInstanceCommands.length} fast instance, ${bundle.slowInstanceCommands.length} slow instance, and ${bundle.workspaceCommands.length} workspace command(s) for ${version}`,
        );
      }
    }
  }

  getBundleForVersion(version: UpgradeCommandVersion): VersionBundle {
    return this.bundlesByVersion.get(version) ?? buildEmptyVersionBundle();
  }

  getAllFastInstanceCommands(): RegisteredFastInstanceCommand[] {
    return UPGRADE_COMMAND_SUPPORTED_VERSIONS.flatMap(
      (version) => this.getBundleForVersion(version).fastInstanceCommands,
    );
  }

  getAllSlowInstanceCommands(): RegisteredSlowInstanceCommand[] {
    return UPGRADE_COMMAND_SUPPORTED_VERSIONS.flatMap(
      (version) => this.getBundleForVersion(version).slowInstanceCommands,
    );
  }

  getUpgradeTape(): TapeSegment[] {
    const segments: TapeSegment[] = [];

    for (const version of UPGRADE_COMMAND_SUPPORTED_VERSIONS) {
      const bundle = this.getBundleForVersion(version);

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

  getLastUpgradeStep(): { name: string } | undefined {
    const segments = this.getUpgradeTape();
    const lastSegment = segments[segments.length - 1];

    if (!lastSegment) {
      return undefined;
    }

    if (lastSegment.kind === 'workspace') {
      return lastSegment.steps[lastSegment.steps.length - 1];
    }

    const { slowInstanceSteps, fastInstanceSteps } = lastSegment;

    if (slowInstanceSteps.length > 0) {
      return slowInstanceSteps[slowInstanceSteps.length - 1];
    }

    return fastInstanceSteps[fastInstanceSteps.length - 1];
  }

  private computeCommandName(
    version: UpgradeCommandVersion,
    className: string,
    timestamp: number,
  ): string {
    return `${version}_${className}_${timestamp}`;
  }

  private validateNoDuplicates(): void {
    for (const [version, bundle] of this.bundlesByVersion) {
      this.validateNoTimestampDuplicatesWithinKind(
        version,
        'fast-instance',
        bundle.fastInstanceCommands,
      );
      this.validateNoTimestampDuplicatesWithinKind(
        version,
        'slow-instance',
        bundle.slowInstanceCommands,
      );
      this.validateNoTimestampDuplicatesWithinKind(
        version,
        'workspace',
        bundle.workspaceCommands,
      );

      const seenNames = new Set<string>();

      const allNames = [
        ...bundle.fastInstanceCommands.map((entry) => entry.name),
        ...bundle.slowInstanceCommands.map((entry) => entry.name),
        ...bundle.workspaceCommands.map((entry) => entry.name),
      ];

      for (const name of allNames) {
        if (seenNames.has(name)) {
          throw new Error(
            `Duplicate upgrade command name "${name}" in version ${version}`,
          );
        }

        seenNames.add(name);
      }
    }
  }

  private validateNoTimestampDuplicatesWithinKind(
    version: UpgradeCommandVersion,
    kind: 'fast-instance' | 'slow-instance' | 'workspace',
    entries:
      | RegisteredFastInstanceCommand[]
      | RegisteredSlowInstanceCommand[]
      | RegisteredWorkspaceCommand[],
  ): void {
    const seenTimestamps = new Set<number>();

    for (const entry of entries) {
      if (seenTimestamps.has(entry.timestamp)) {
        throw new Error(
          `Duplicate ${kind} command timestamp ${entry.timestamp} in version ${version} (command: ${entry.name})`,
        );
      }

      seenTimestamps.add(entry.timestamp);
    }
  }
}
