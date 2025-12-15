import chalk from 'chalk';
import { Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, MoreThanOrEqual, type Repository } from 'typeorm';

import { MigrationCommandRunner } from 'src/database/commands/command-runners/migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceDataSource } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource';
import { type GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

export type WorkspacesMigrationCommandOptions = {
  workspaceIds: string[];
  startFromWorkspaceId?: string;
  workspaceCountLimit?: number;
  dryRun?: boolean;
  verbose?: boolean;
};

export type RunOnWorkspaceArgs = {
  options: WorkspacesMigrationCommandOptions;
  workspaceId: string;
  dataSource?: GlobalWorkspaceDataSource;
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

export abstract class WorkspacesMigrationCommandRunner<
  Options extends
    WorkspacesMigrationCommandOptions = WorkspacesMigrationCommandOptions,
> extends MigrationCommandRunner {
  protected workspaceIds: Set<string> = new Set();
  private startFromWorkspaceId: string | undefined;
  private workspaceCountLimit: number | undefined;
  public migrationReport: WorkspaceMigrationReport = {
    fail: [],
    success: [],
  };

  constructor(
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    protected readonly activationStatuses: WorkspaceActivationStatus[],
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
      'workspace id. Command runs on all workspaces matching the activation statuses if not provided.',
    required: false,
  })
  parseWorkspaceId(val: string): Set<string> {
    this.workspaceIds.add(val);

    return this.workspaceIds;
  }

  protected async fetchWorkspaceIds(): Promise<string[]> {
    const workspaces = await this.workspaceRepository.find({
      select: ['id'],
      where: {
        activationStatus: In(this.activationStatuses),
        ...(this.startFromWorkspaceId
          ? { id: MoreThanOrEqual(this.startFromWorkspaceId) }
          : {}),
      },
      order: {
        id: 'ASC',
      },
      take: this.workspaceCountLimit,
    });

    return workspaces.map((workspace) => workspace.id);
  }

  override async runMigrationCommand(
    _passedParams: string[],
    options: Options,
  ) {
    const workspaceIdsToProcess =
      this.workspaceIds.size > 0
        ? Array.from(this.workspaceIds)
        : await this.fetchWorkspaceIds();

    if (options.dryRun) {
      this.logger.log(chalk.yellow('Dry run mode: No changes will be applied'));
    }

    for (const [index, workspaceId] of workspaceIdsToProcess.entries()) {
      this.logger.log(
        `Running command on workspace ${workspaceId} ${index + 1}/${workspaceIdsToProcess.length}`,
      );

      try {
        const authContext = buildSystemAuthContext(workspaceId);

        await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
          authContext,
          async () => {
            const workspaceHasDataSource =
              await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceId(
                workspaceId,
              );

            const dataSource = isDefined(workspaceHasDataSource)
              ? await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource()
              : undefined;

            await this.runOnWorkspace({
              options,
              workspaceId,
              dataSource,
              index: index,
              total: workspaceIdsToProcess.length,
            });
          },
        );

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
    }

    this.migrationReport.fail.forEach(({ error, workspaceId }) =>
      this.logger.error(`Error in workspace ${workspaceId}: ${error.message}`),
    );
  }

  public abstract runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void>;
}
