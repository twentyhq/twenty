import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { type MigrationInterface } from 'typeorm';

import { type ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { type WorkspaceCommandRunner } from 'src/database/commands/command-runners/workspace.command-runner';
import { getRegisteredWorkspaceCommandMetadata } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getRegisteredInstanceCommandMetadata } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import {
  UPGRADE_COMMAND_SUPPORTED_VERSIONS,
  type UpgradeCommandVersion,
} from 'src/engine/constants/upgrade-command-supported-versions.constant';
import { isDefined } from 'twenty-shared/utils';

type WorkspaceCommand =
  | WorkspaceCommandRunner
  | ActiveOrSuspendedWorkspaceCommandRunner;

type RegisteredInstanceCommand = {
  name: string;
  command: MigrationInterface;
  timestamp: number;
};

type RegisteredWorkspaceCommand = {
  name: string;
  command: WorkspaceCommand;
  timestamp: number;
};

type VersionBucket = {
  instanceCommands: RegisteredInstanceCommand[];
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
        instanceCommands: [],
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
          bucket.instanceCommands.push({
            name: this.computeCommandName(
              instanceCommandMetadata.version,
              (instance as MigrationInterface).constructor.name,
              instanceCommandMetadata.timestamp,
            ),
            command: instance as MigrationInterface,
            timestamp: instanceCommandMetadata.timestamp,
          });
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
      bucket.instanceCommands.sort(
        (entryA, entryB) => entryA.timestamp - entryB.timestamp,
      );
      bucket.workspaceCommands.sort(
        (entryA, entryB) => entryA.timestamp - entryB.timestamp,
      );
    }

    this.validateNoDuplicates();

    for (const [version, bucket] of this.bucketsByVersion) {
      const totalCount =
        bucket.instanceCommands.length + bucket.workspaceCommands.length;

      if (totalCount > 0) {
        this.logger.log(
          `Registered ${bucket.instanceCommands.length} instance command(s) and ${bucket.workspaceCommands.length} workspace command(s) for ${version}`,
        );
      }
    }
  }

  getInstanceCommandsForVersion(
    version: UpgradeCommandVersion,
  ): MigrationInterface[] {
    return (
      this.bucketsByVersion
        .get(version)
        ?.instanceCommands.map((entry) => entry.command) ?? []
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

  getAllInstanceCommands(): {
    version: UpgradeCommandVersion;
    migration: MigrationInterface;
  }[] {
    const result: {
      version: UpgradeCommandVersion;
      migration: MigrationInterface;
    }[] = [];

    for (const version of UPGRADE_COMMAND_SUPPORTED_VERSIONS) {
      for (const command of this.getInstanceCommandsForVersion(version)) {
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
        'instance',
        bucket.instanceCommands,
      );
      this.validateNoTimestampDuplicatesWithinKind(
        version,
        'workspace',
        bucket.workspaceCommands,
      );

      const seenNames = new Set<string>();

      const allNames = [
        ...bucket.instanceCommands.map((entry) => entry.name),
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
    kind: 'instance' | 'workspace',
    entries: RegisteredInstanceCommand[] | RegisteredWorkspaceCommand[],
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
