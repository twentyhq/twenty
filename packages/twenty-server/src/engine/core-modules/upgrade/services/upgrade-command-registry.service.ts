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

type RegisteredFastInstanceCommand = {
  name: string;
  command: FastInstanceCommand;
  timestamp: number;
};

type RegisteredSlowInstanceCommand = {
  name: string;
  command: SlowInstanceCommand;
  timestamp: number;
};

type RegisteredWorkspaceCommand = {
  name: string;
  command: WorkspaceCommand;
  timestamp: number;
};

type VersionBucket = {
  fastInstanceCommands: RegisteredFastInstanceCommand[];
  slowInstanceCommands: RegisteredSlowInstanceCommand[];
  workspaceCommands: RegisteredWorkspaceCommand[];
};

@Injectable()
export class UpgradeCommandRegistryService implements OnModuleInit {
  private readonly logger = new Logger(UpgradeCommandRegistryService.name);

  private readonly bucketsByVersion = new Map<
    UpgradeCommandVersion,
    VersionBucket
  >();

  constructor(private readonly discoveryService: DiscoveryService) {}

  onModuleInit(): void {
    for (const version of UPGRADE_COMMAND_SUPPORTED_VERSIONS) {
      this.bucketsByVersion.set(version, {
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
        const bucket = this.bucketsByVersion.get(
          instanceCommandMetadata.version,
        );

        if (isDefined(bucket)) {
          const entry = {
            name: this.computeCommandName(
              instanceCommandMetadata.version,
              (instance as FastInstanceCommand).constructor.name,
              instanceCommandMetadata.timestamp,
            ),
            timestamp: instanceCommandMetadata.timestamp,
          };

          if (instanceCommandMetadata.type === 'slow') {
            bucket.slowInstanceCommands.push({
              ...entry,
              command: instance as SlowInstanceCommand,
            });
          } else {
            bucket.fastInstanceCommands.push({
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
        const bucket = this.bucketsByVersion.get(
          workspaceCommandMetadata.version,
        );

        if (isDefined(bucket)) {
          bucket.workspaceCommands.push({
            name: this.computeCommandName(
              workspaceCommandMetadata.version,
              (instance as WorkspaceCommand).constructor.name,
              workspaceCommandMetadata.timestamp,
            ),
            command: instance as WorkspaceCommand,
            timestamp: workspaceCommandMetadata.timestamp,
          });
        }
      }
    }

    for (const [, bucket] of this.bucketsByVersion) {
      bucket.fastInstanceCommands.sort(
        (entryA, entryB) => entryA.timestamp - entryB.timestamp,
      );
      bucket.slowInstanceCommands.sort(
        (entryA, entryB) => entryA.timestamp - entryB.timestamp,
      );
      bucket.workspaceCommands.sort(
        (entryA, entryB) => entryA.timestamp - entryB.timestamp,
      );
    }

    this.validateNoDuplicates();

    for (const [version, bucket] of this.bucketsByVersion) {
      const totalCount =
        bucket.fastInstanceCommands.length +
        bucket.slowInstanceCommands.length +
        bucket.workspaceCommands.length;

      if (totalCount > 0) {
        this.logger.log(
          `Registered ${bucket.fastInstanceCommands.length} fast instance, ${bucket.slowInstanceCommands.length} slow instance, and ${bucket.workspaceCommands.length} workspace command(s) for ${version}`,
        );
      }
    }
  }

  getFastInstanceCommandsForVersion(
    version: UpgradeCommandVersion,
  ): FastInstanceCommand[] {
    return (
      this.bucketsByVersion
        .get(version)
        ?.fastInstanceCommands.map((entry) => entry.command) ?? []
    );
  }

  getSlowInstanceCommandsForVersion(
    version: UpgradeCommandVersion,
  ): SlowInstanceCommand[] {
    return (
      this.bucketsByVersion
        .get(version)
        ?.slowInstanceCommands.map((entry) => entry.command) ?? []
    );
  }

  getWorkspaceCommandsForVersion(
    version: UpgradeCommandVersion,
  ): WorkspaceCommand[] {
    return (
      this.bucketsByVersion
        .get(version)
        ?.workspaceCommands.map((entry) => entry.command) ?? []
    );
  }

  getAllFastInstanceCommands(): {
    version: UpgradeCommandVersion;
    migration: FastInstanceCommand;
  }[] {
    const result: {
      version: UpgradeCommandVersion;
      migration: FastInstanceCommand;
    }[] = [];

    for (const version of UPGRADE_COMMAND_SUPPORTED_VERSIONS) {
      for (const command of this.getFastInstanceCommandsForVersion(version)) {
        result.push({ version, migration: command });
      }
    }

    return result;
  }

  getAllSlowInstanceCommands(): {
    version: UpgradeCommandVersion;
    migration: SlowInstanceCommand;
  }[] {
    const result: {
      version: UpgradeCommandVersion;
      migration: SlowInstanceCommand;
    }[] = [];

    for (const version of UPGRADE_COMMAND_SUPPORTED_VERSIONS) {
      for (const command of this.getSlowInstanceCommandsForVersion(version)) {
        result.push({ version, migration: command });
      }
    }

    return result;
  }

  private computeCommandName(
    version: UpgradeCommandVersion,
    className: string,
    timestamp: number,
  ): string {
    return `${version}_${className}_${timestamp}`;
  }

  private validateNoDuplicates(): void {
    for (const [version, bucket] of this.bucketsByVersion) {
      this.validateNoTimestampDuplicatesWithinKind(
        version,
        'fast-instance',
        bucket.fastInstanceCommands,
      );
      this.validateNoTimestampDuplicatesWithinKind(
        version,
        'slow-instance',
        bucket.slowInstanceCommands,
      );
      this.validateNoTimestampDuplicatesWithinKind(
        version,
        'workspace',
        bucket.workspaceCommands,
      );

      const seenNames = new Set<string>();

      const allNames = [
        ...bucket.fastInstanceCommands.map((entry) => entry.name),
        ...bucket.slowInstanceCommands.map((entry) => entry.name),
        ...bucket.workspaceCommands.map((entry) => entry.name),
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
