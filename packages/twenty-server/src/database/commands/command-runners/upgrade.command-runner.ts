import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { CommandRunner, Option } from 'nest-commander';
import { SemVer } from 'semver';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { MigrationInterface, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import {
  type WorkspaceIteratorContext,
  WorkspaceIteratorService,
} from 'src/database/commands/command-runners/workspace-iterator.service';
import {
  type RunOnWorkspaceArgs,
  WorkspaceCommandRunner,
} from 'src/database/commands/command-runners/workspace.command-runner';
import { CoreMigrationRunnerService } from 'src/database/commands/core-migration/services/core-migration-runner.service';
import { RegisteredCoreMigrationService } from 'src/database/commands/core-migration/services/registered-core-migration-registry.service';
import { CommandLogger } from 'src/database/commands/logger';
import { type UpgradeCommandVersion } from 'src/engine/constants/upgrade-command-supported-versions.constant';
import { CoreEngineVersionService } from 'src/engine/core-engine-version/services/core-engine-version.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';
import {
  type CompareVersionMajorAndMinorReturnType,
  compareVersionMajorAndMinor,
} from 'src/utils/version/compare-version-minor-and-major';

export type VersionCommands = (
  | WorkspaceCommandRunner
  | ActiveOrSuspendedWorkspaceCommandRunner
)[];
export type AllCommands = Record<UpgradeCommandVersion, VersionCommands>;

export type UpgradeCommandOptions = {
  workspaceId?: Set<string>;
  startFromWorkspaceId?: string;
  workspaceCountLimit?: number;
  dryRun?: boolean;
  verbose?: boolean;
};

type VersionContext = {
  fromWorkspaceVersion: SemVer;
  currentAppVersion: SemVer;
  currentVersionMajorMinor: UpgradeCommandVersion;
  instanceCommands: MigrationInterface[];
  workspaceCommands: VersionCommands;
};

export abstract class UpgradeCommandRunner extends CommandRunner {
  protected logger: CommandLogger;

  public abstract allCommands: AllCommands;

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly coreEngineVersionService: CoreEngineVersionService,
    protected readonly workspaceVersionService: WorkspaceVersionService,
    protected readonly coreMigrationRunnerService: CoreMigrationRunnerService,
    protected readonly versionedMigrationRegistryService: RegisteredCoreMigrationService,
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super();
    this.logger = new CommandLogger({
      verbose: false,
      constructorName: this.constructor.name,
    });
  }

  @Option({
    flags: '-d, --dry-run',
    description: 'Simulate the command without making actual changes',
    required: false,
  })
  parseDryRun(): boolean {
    return true;
  }

  @Option({
    flags: '-v, --verbose',
    description: 'Verbose output',
    required: false,
  })
  parseVerbose(): boolean {
    return true;
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description:
      'workspace id. Command runs on all active/suspended workspaces if not provided.',
    required: false,
  })
  parseWorkspaceId(val: string, previous?: Set<string>): Set<string> {
    const accumulator = previous ?? new Set<string>();

    accumulator.add(val);

    return accumulator;
  }

  @Option({
    flags: '--start-from-workspace-id [workspace_id]',
    description:
      'Start from a specific workspace id. Workspaces are processed in ascending order of id.',
    required: false,
  })
  parseStartFromWorkspaceId(val: string): string {
    return val;
  }

  @Option({
    flags: '--workspace-count-limit [count]',
    description:
      'Limit the number of workspaces to process. Workspaces are processed in ascending order of id.',
    required: false,
  })
  parseWorkspaceCountLimit(val: string): number {
    const limit = parseInt(val);

    if (isNaN(limit)) {
      throw new Error('Workspace count limit must be a number');
    }

    if (limit <= 0) {
      throw new Error('Workspace count limit must be greater than 0');
    }

    return limit;
  }

  override async run(
    _passedParams: string[],
    options: UpgradeCommandOptions,
  ): Promise<void> {
    if (options.verbose) {
      this.logger = new CommandLogger({
        verbose: true,
        constructorName: this.constructor.name,
      });
    }

    try {
      const versionContext = this.resolveVersionContext();

      this.logger.log(
        chalk.blue(
          [
            'Initialized upgrade context with:',
            `- currentVersion (migrating to): ${versionContext.currentAppVersion}`,
            `- fromWorkspaceVersion: ${versionContext.fromWorkspaceVersion}`,
            `- ${versionContext.instanceCommands.length} instance commands (from registry)`,
            `- ${versionContext.workspaceCommands.length} workspace commands`,
          ].join('\n   '),
        ),
      );

      const hasWorkspaces =
        await this.workspaceVersionService.hasActiveOrSuspendedWorkspaces();

      if (!hasWorkspaces) {
        this.logger.log(
          chalk.blue('Fresh installation detected, skipping migration'),
        );

        return;
      }

      const workspacesBelowMinimumVersion =
        await this.workspaceVersionService.getWorkspacesBelowVersion(
          versionContext.fromWorkspaceVersion.version,
        );

      if (workspacesBelowMinimumVersion.length > 0) {
        const ineligibleIds = workspacesBelowMinimumVersion
          .map((workspace) => workspace.id)
          .join(', ');

        throw new Error(
          `Unable to run the upgrade command. Aborting the upgrade process.
Workspaces below minimum version (${versionContext.fromWorkspaceVersion.version}): ${ineligibleIds}.
Please roll back to that version and run the upgrade command again.`,
        );
      }

      for (const instanceCommand of versionContext.instanceCommands) {
        const migrationName = instanceCommand.constructor.name;
        const result =
          await this.coreMigrationRunnerService.runSingleMigration(
            migrationName,
          );

        if (result.status === 'fail') {
          if (result.code === 'already-executed') {
            this.logger.warn(
              `Core migration ${migrationName} already executed, skipping`,
            );

            continue;
          }

          this.logger.error(
            `Core migration ${migrationName} failed with code: ${result.code}`,
          );

          if (isDefined(result.error)) {
            this.logger.error(
              result.error instanceof Error
                ? (result.error.stack ?? result.error.message)
                : String(result.error),
            );
          }

          throw new Error(
            `Core migration ${migrationName} failed: ${result.code}`,
          );
        }

        this.logger.log(
          `Core migration ${migrationName} executed successfully`,
        );
      }

      const iteratorReport = await this.workspaceIteratorService.iterate({
        workspaceIds:
          options.workspaceId && options.workspaceId.size > 0
            ? Array.from(options.workspaceId)
            : undefined,
        startFromWorkspaceId: options.startFromWorkspaceId,
        workspaceCountLimit: options.workspaceCountLimit,
        dryRun: options.dryRun,
        callback: async (context) => {
          await this.runOnWorkspace(context, options, versionContext);
        },
      });

      if (iteratorReport.fail.length > 0) {
        this.logger.error(
          chalk.red(
            `Upgrade completed with ${iteratorReport.fail.length} workspace failure(s)`,
          ),
        );
      }

      this.logger.log(
        chalk.blue(
          `Upgrade summary: ${iteratorReport.success.length} succeeded, ${iteratorReport.fail.length} failed`,
        ),
      );
      this.logger.log(chalk.blue('Command completed!'));
    } catch (error) {
      this.logger.error(chalk.red(`Upgrade failed: ${error.message}`));
      throw error;
    }
  }

  private resolveVersionContext(): VersionContext {
    const currentAppVersion = this.coreEngineVersionService.getCurrentVersion();
    const currentVersionMajorMinor =
      `${currentAppVersion.major}.${currentAppVersion.minor}.0` as UpgradeCommandVersion;
    const workspaceCommands = this.allCommands[currentVersionMajorMinor];

    if (!isDefined(workspaceCommands)) {
      throw new Error(
        `No command found for version ${currentAppVersion}. Please check the commands record.`,
      );
    }

    const fromWorkspaceVersion =
      this.coreEngineVersionService.getPreviousVersion();

    const instanceCommands =
      this.versionedMigrationRegistryService.getInstanceCommandsForVersion(
        currentVersionMajorMinor,
      );

    return {
      fromWorkspaceVersion,
      currentAppVersion,
      currentVersionMajorMinor,
      workspaceCommands,
      instanceCommands,
    };
  }

  private async runOnWorkspace(
    iteratorContext: WorkspaceIteratorContext,
    options: UpgradeCommandOptions,
    versionContext: VersionContext,
  ): Promise<void> {
    const { workspaceId, index, total } = iteratorContext;
    const { fromWorkspaceVersion, currentAppVersion, workspaceCommands } =
      versionContext;

    this.logger.log(
      chalk.blue(
        `${options.dryRun ? '(dry run) ' : ''}Upgrading workspace ${workspaceId} from=${fromWorkspaceVersion} to=${currentAppVersion} ${index + 1}/${total}`,
      ),
    );

    const versionCompareResult =
      await this.compareWorkspaceVersionToFromVersion(
        workspaceId,
        fromWorkspaceVersion,
      );

    switch (versionCompareResult) {
      case 'lower': {
        throw new Error(
          `WORKSPACE_VERSION_MISSMATCH Upgrade for workspace ${workspaceId} failed as its version is beneath fromWorkspaceVersion=${fromWorkspaceVersion.version}`,
        );
      }
      case 'equal': {
        for (const workspaceCommand of workspaceCommands) {
          await workspaceCommand.runOnWorkspace({
            options: options as RunOnWorkspaceArgs['options'],
            workspaceId,
            dataSource: iteratorContext.dataSource,
            index,
            total,
          });
        }

        if (!options.dryRun) {
          await this.workspaceRepository.update(
            { id: workspaceId },
            { version: currentAppVersion.version },
          );
        }

        this.logger.log(
          chalk.blue(`Upgrade for workspace ${workspaceId} completed.`),
        );

        return;
      }
      case 'higher': {
        this.logger.log(
          chalk.blue(
            `Upgrade for workspace ${workspaceId} ignored as is already at a higher version.`,
          ),
        );

        return;
      }
      default: {
        assertUnreachable(versionCompareResult);
      }
    }
  }

  private async compareWorkspaceVersionToFromVersion(
    workspaceId: string,
    fromWorkspaceVersion: SemVer,
  ): Promise<CompareVersionMajorAndMinorReturnType> {
    const workspace = await this.workspaceRepository.findOneByOrFail({
      id: workspaceId,
    });
    const currentWorkspaceVersion = workspace.version;

    if (!isDefined(currentWorkspaceVersion)) {
      throw new Error(`WORKSPACE_VERSION_NOT_DEFINED workspace=${workspaceId}`);
    }

    return compareVersionMajorAndMinor(
      currentWorkspaceVersion,
      fromWorkspaceVersion.version,
    );
  }
}
