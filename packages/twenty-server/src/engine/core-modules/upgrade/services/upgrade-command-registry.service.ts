import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { type ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { type WorkspaceCommandRunner } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  TWENTY_ALL_VERSIONS,
  type TwentyAllVersion,
} from 'src/engine/core-modules/upgrade/constants/twenty-all-versions.constant';
import { TWENTY_CROSS_UPGRADE_SUPPORTED_VERSIONS } from 'src/engine/core-modules/upgrade/constants/twenty-cross-upgrade-supported-version.constant';
import { TWENTY_CURRENT_VERSION } from 'src/engine/core-modules/upgrade/constants/twenty-current-version.constant';
import { TWENTY_NEXT_VERSIONS } from 'src/engine/core-modules/upgrade/constants/twenty-next-versions.constant';
import { TWENTY_PREVIOUS_VERSIONS } from 'src/engine/core-modules/upgrade/constants/twenty-previous-versions.constant';
import { getRegisteredInstanceCommandMetadata } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { getRegisteredWorkspaceCommandMetadata } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { isDefined } from 'twenty-shared/utils';

type WorkspaceCommand =
  | WorkspaceCommandRunner
  | ActiveOrSuspendedWorkspaceCommandRunner;

export type RegisteredFastInstanceCommand = {
  name: string;
  command: FastInstanceCommand;
  version: TwentyAllVersion;
  timestamp: number;
};

export type RegisteredSlowInstanceCommand = {
  name: string;
  command: SlowInstanceCommand;
  version: TwentyAllVersion;
  timestamp: number;
};

export type RegisteredWorkspaceCommand = {
  name: string;
  command: WorkspaceCommand;
  version: TwentyAllVersion;
  timestamp: number;
};

type VersionBundle = {
  fastInstanceCommands: RegisteredFastInstanceCommand[];
  slowInstanceCommands: RegisteredSlowInstanceCommand[];
  workspaceCommands: RegisteredWorkspaceCommand[];
};

const buildEmptyVersionBundle = (): VersionBundle => ({
  fastInstanceCommands: [],
  slowInstanceCommands: [],
  workspaceCommands: [],
});

@Injectable()
export class UpgradeCommandRegistryService implements OnModuleInit {
  private readonly logger = new Logger(UpgradeCommandRegistryService.name);

  private readonly bundlesByVersion = new Map<
    TwentyAllVersion,
    VersionBundle
  >();

  constructor(private readonly discoveryService: DiscoveryService) {}

  onModuleInit(): void {
    for (const version of TWENTY_ALL_VERSIONS) {
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

        if (!isDefined(bundle)) {
          continue;
        }

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

        continue;
      }

      const workspaceCommandMetadata =
        getRegisteredWorkspaceCommandMetadata(metatype);

      if (isDefined(workspaceCommandMetadata)) {
        const bundle = this.bundlesByVersion.get(
          workspaceCommandMetadata.version,
        );

        if (!isDefined(bundle)) {
          continue;
        }

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

    this.validateNoVersionDuplicatesAcrossConstants();
    this.validatePreviousVersionsNotEmpty();
    this.validateNoDuplicates();
    this.validateAtLeastOneVersionBundleHasWorkspaceCommands();

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

  getBundleForVersion(version: TwentyAllVersion): VersionBundle {
    return this.bundlesByVersion.get(version) ?? buildEmptyVersionBundle();
  }

  getLastWorkspaceCommandForVersion(
    version: TwentyAllVersion,
  ): RegisteredWorkspaceCommand | undefined {
    const bundle = this.getBundleForVersion(version);

    return bundle.workspaceCommands[bundle.workspaceCommands.length - 1];
  }

  getCrossUpgradeSupportedFastInstanceCommands(): RegisteredFastInstanceCommand[] {
    return TWENTY_CROSS_UPGRADE_SUPPORTED_VERSIONS.flatMap(
      (version) => this.getBundleForVersion(version).fastInstanceCommands,
    );
  }

  getCrossUpgradeSupportedSlowInstanceCommands(): RegisteredSlowInstanceCommand[] {
    return TWENTY_CROSS_UPGRADE_SUPPORTED_VERSIONS.flatMap(
      (version) => this.getBundleForVersion(version).slowInstanceCommands,
    );
  }

  private computeCommandName(
    version: TwentyAllVersion,
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

  private validateAtLeastOneVersionBundleHasWorkspaceCommands(): void {
    let totalCommandCount = 0;
    let hasWorkspaceCommands = false;

    for (const version of TWENTY_CROSS_UPGRADE_SUPPORTED_VERSIONS) {
      const bundle = this.getBundleForVersion(version);

      totalCommandCount +=
        bundle.fastInstanceCommands.length +
        bundle.slowInstanceCommands.length +
        bundle.workspaceCommands.length;

      if (bundle.workspaceCommands.length > 0) {
        hasWorkspaceCommands = true;
      }
    }

    // UpgradeModule is loaded in the worker transitively via WorkspaceModule,
    // but no command modules are imported — zero providers are discovered.
    // TODO: split WorkspaceModule so the worker doesn't pull in UpgradeModule
    if (totalCommandCount === 0) {
      this.logger.warn(
        'No upgrade commands discovered — skipping workspace command validation',
      );

      return;
    }

    if (!hasWorkspaceCommands) {
      throw new Error(
        'Upgrade sequence must contain at least one workspace command',
      );
    }
  }

  private validateNoTimestampDuplicatesWithinKind(
    version: TwentyAllVersion,
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

  private validateNoVersionDuplicatesAcrossConstants(): void {
    const allVersions = [
      ...TWENTY_PREVIOUS_VERSIONS,
      TWENTY_CURRENT_VERSION,
      ...TWENTY_NEXT_VERSIONS,
    ];

    const uniqueVersions = new Set(allVersions);

    if (uniqueVersions.size !== allVersions.length) {
      const duplicates = allVersions.filter(
        (version, index) => allVersions.indexOf(version) !== index,
      );

      throw new Error(
        `Duplicate version(s) across TWENTY_PREVIOUS_VERSIONS, TWENTY_CURRENT_VERSION, and TWENTY_NEXT_VERSIONS: ${duplicates.join(', ')}`,
      );
    }
  }

  private validatePreviousVersionsNotEmpty(): void {
    if ((TWENTY_PREVIOUS_VERSIONS as readonly string[]).length === 0) {
      throw new Error(
        'TWENTY_PREVIOUS_VERSIONS must contain at least one version before TWENTY_CURRENT_VERSION',
      );
    }
  }
}
