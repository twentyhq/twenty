import chalk from 'chalk';
import { Option } from 'nest-commander';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, MoreThanOrEqual, Repository } from 'typeorm';

import { MigrationCommandRunner } from 'src/database/commands/command-runners/migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

export type ActiveOrSuspendedWorkspacesMigrationCommandOptions = {
  workspaceIds: string[];
  startFromWorkspaceId?: string;
  workspaceCountLimit?: number;
  dryRun?: boolean;
  verbose?: boolean;
};

export type RunOnWorkspaceArgs = {
  options: ActiveOrSuspendedWorkspacesMigrationCommandOptions;
  workspaceId: string;
  dataSource: WorkspaceDataSource;
  index: number;
  total: number;
};

export type WorkspaceMigrationReport = {
  fail: {
    workspaceId: string;
    error: Error;
  }[];
  success: {
    workspaceId: string;
  }[];
};

export abstract class ActiveOrSuspendedWorkspacesMigrationCommandRunner<
  Options extends
    ActiveOrSuspendedWorkspacesMigrationCommandOptions = ActiveOrSuspendedWorkspacesMigrationCommandOptions,
> extends MigrationCommandRunner {
  private workspaceIds: Set<string> = new Set();
  private startFromWorkspaceId: string | undefined;
  private workspaceCountLimit: number | undefined;
  public migrationReport: WorkspaceMigrationReport = {
    fail: [],
    success: [],
  };

  constructor(
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super();
  }

  @Option({
    flags: '--start-from-workspace-id [workspace_id]',
    description:
      'Start from a specific workspace id. Workspaces are processed in ascending order of id.',
    required: false,
  })
  parseStartFromWorkspaceId(val: string): string {
    this.startFromWorkspaceId = val;

    return val;
  }

  @Option({
    flags: '--workspace-count-limit [count]',
    description:
      'Limit the number of workspaces to process. Workspaces are processed in ascending order of id.',
    required: false,
  })
  parseWorkspaceCountLimit(val: string): number {
    this.workspaceCountLimit = parseInt(val);

    if (isNaN(this.workspaceCountLimit)) {
      throw new Error('Workspace count limit must be a number');
    }

    if (this.workspaceCountLimit <= 0) {
      throw new Error('Workspace count limit must be greater than 0');
    }

    return this.workspaceCountLimit;
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description:
      'workspace id. Command runs on all active workspaces if not provided.',
    required: false,
  })
  parseWorkspaceId(val: string): Set<string> {
    this.workspaceIds.add(val);

    return this.workspaceIds;
  }

  protected async fetchActiveWorkspaceIds(): Promise<string[]> {
    const activeWorkspaces = await this.workspaceRepository.find({
      select: ['id'],
      where: {
        activationStatus: In([
          WorkspaceActivationStatus.ACTIVE,
          WorkspaceActivationStatus.SUSPENDED,
        ]),
        ...(this.startFromWorkspaceId
          ? { id: MoreThanOrEqual(this.startFromWorkspaceId) }
          : {}),
      },
      order: {
        id: 'ASC',
      },
      take: this.workspaceCountLimit,
    });

    return activeWorkspaces.map((workspace) => workspace.id);
  }

  override async runMigrationCommand(
    _passedParams: string[],
    options: Options,
  ) {
    const activeWorkspaceIds =
      this.workspaceIds.size > 0
        ? Array.from(this.workspaceIds)
        : await this.fetchActiveWorkspaceIds();

    if (options.dryRun) {
      this.logger.log(chalk.yellow('Dry run mode: No changes will be applied'));
    }

    for (const [index, workspaceId] of activeWorkspaceIds.entries()) {
      this.logger.log(
        `Running command on workspace ${workspaceId} ${index + 1}/${activeWorkspaceIds.length}`,
      );

      try {
        const dataSource =
          await this.twentyORMGlobalManager.getDataSourceForWorkspace({
            workspaceId,
          });

        await this.runOnWorkspace({
          options,
          workspaceId,
          dataSource,
          index: index,
          total: activeWorkspaceIds.length,
        });
        this.migrationReport.success.push({
          workspaceId,
        });
      } catch (error) {
        this.migrationReport.fail.push({
          error,
          workspaceId,
        });
        this.logger.warn(
          chalk.red(`Error in workspace ${workspaceId}: ${error.message}`),
        );
      }

      try {
        await this.twentyORMGlobalManager.destroyDataSourceForWorkspace(
          workspaceId,
        );
      } catch (error) {
        this.logger.error(error);
      }
    }

    this.migrationReport.fail.forEach(({ error, workspaceId }) =>
      this.logger.error(`Error in workspace ${workspaceId}: ${error.message}`),
    );
  }

  public abstract runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void>;
}
