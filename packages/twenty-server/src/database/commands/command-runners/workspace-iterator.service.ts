import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { isNonEmptyString } from '@sniptt/guards';
import {
  PROVISIONED_WORKSPACE_ACTIVATION_STATUSES,
  WorkspaceActivationStatus,
} from 'twenty-shared/workspace';
import { isDefined } from 'twenty-shared/utils';
import { DataSource, MoreThanOrEqual, Raw, Repository } from 'typeorm';

import { CommandShutdownService } from 'src/database/commands/command-runners/command-shutdown.service';
import { activationStatusIn } from 'src/database/commands/command-runners/utils/activation-status-in.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceMigrationRunnerException } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

export type WorkspaceIteratorShard = {
  index: number;
  total: number;
};

export type WorkspaceIteratorArgs = {
  workspaceIds?: string[];
  activationStatuses?: WorkspaceActivationStatus[];
  startFromWorkspaceId?: string;
  workspaceCountLimit?: number;
  shard?: WorkspaceIteratorShard;
  dryRun?: boolean;
  callback: (context: WorkspaceIteratorContext) => Promise<void>;
};

export type WorkspaceIteratorContext = {
  workspaceId: string;
  databaseSchema?: string;
  dataSource?: DataSource;
  index: number;
  total: number;
};

export type WorkspaceIteratorReport = {
  fail: {
    workspaceId: string;
    error: Error;
  }[];
  success: {
    workspaceId: string;
  }[];
  interrupted: boolean;
};

const DEFAULT_ACTIVATION_STATUSES = PROVISIONED_WORKSPACE_ACTIVATION_STATUSES;

@Injectable()
export class WorkspaceIteratorService {
  private readonly logger = new Logger(WorkspaceIteratorService.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly commandShutdownService: CommandShutdownService,
  ) {}

  listenToShutdownSignals(): void {
    this.commandShutdownService.listenToShutdownSignals();
  }

  async iterate(args: WorkspaceIteratorArgs): Promise<WorkspaceIteratorReport> {
    const { callback, ...options } = args;

    const report: WorkspaceIteratorReport = {
      fail: [],
      success: [],
      interrupted: false,
    };

    const workspaceIdsToProcess =
      options.workspaceIds && options.workspaceIds.length > 0
        ? options.workspaceIds
        : await this.fetchWorkspaceIds(options);

    if (options.dryRun) {
      this.logger.log(chalk.yellow('Dry run mode: No changes will be applied'));
    }

    for (const [index, workspaceId] of workspaceIdsToProcess.entries()) {
      if (this.commandShutdownService.isShutdownRequested()) {
        this.logger.warn(
          `Shutdown requested, stopping before workspace ${workspaceId}. ` +
            `${workspaceIdsToProcess.length - index} workspace(s) left untouched.`,
        );

        report.interrupted = true;

        break;
      }

      this.logger.log(
        `Running on workspace ${workspaceId} ${index + 1}/${workspaceIdsToProcess.length}`,
      );

      try {
        const authContext = buildSystemAuthContext(workspaceId);

        await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
          const workspace = await this.workspaceRepository.findOne({
            select: ['databaseSchema'],
            where: { id: workspaceId },
          });

          const dataSource = isNonEmptyString(workspace?.databaseSchema)
            ? this.coreDataSource
            : undefined;

          if (!isDefined(dataSource)) {
            this.logger.warn(
              `Could not retrieve a workspace data source for workspace ${workspaceId} ` +
                `(index ${index + 1}/${workspaceIdsToProcess.length}): ` +
                `workspaceRowFound=${isDefined(workspace)}, ` +
                `databaseSchema=${JSON.stringify(workspace?.databaseSchema ?? null)}`,
            );
          }

          await callback({
            workspaceId,
            databaseSchema: workspace?.databaseSchema ?? undefined,
            dataSource,
            index,
            total: workspaceIdsToProcess.length,
          });
        }, authContext);

        report.success.push({ workspaceId });
      } catch (error: unknown) {
        report.fail.push({ error: error as Error, workspaceId });
      }
    }

    report.fail.forEach(({ error, workspaceId }) => {
      this.logger.error(
        `Error in workspace ${workspaceId}: ${error.message}`,
        error.stack,
      );

      if (error instanceof WorkspaceMigrationRunnerException && error.errors) {
        for (const [label, innerError] of Object.entries(error.errors)) {
          if (!isDefined(innerError)) continue;

          if (innerError instanceof Error) {
            this.logger.error(
              `Caused by ${label} in workspace ${workspaceId}: ${innerError.message}`,
              innerError.stack,
            );
          } else {
            this.logger.error(
              `Caused by ${label} in workspace ${workspaceId}: ${String(innerError)}`,
            );
          }
        }
      }
    });

    return report;
  }

  private async fetchWorkspaceIds(
    options: Pick<
      WorkspaceIteratorArgs,
      | 'activationStatuses'
      | 'startFromWorkspaceId'
      | 'workspaceCountLimit'
      | 'shard'
    >,
  ): Promise<string[]> {
    const activationStatuses =
      options.activationStatuses ?? DEFAULT_ACTIVATION_STATUSES;
    const shard = options.shard;

    if (isDefined(shard)) {
      if (isDefined(options.startFromWorkspaceId)) {
        throw new Error(
          'Cannot combine shard with startFromWorkspaceId in workspace iterator',
        );
      }

      if (shard.index < 0 || shard.index >= shard.total || shard.total > 256) {
        throw new Error(
          `Invalid workspace iterator shard ${shard.index}/${shard.total}`,
        );
      }
    }

    const workspaces = await this.workspaceRepository.find({
      select: ['id'],
      where: {
        activationStatus: activationStatusIn(activationStatuses),
        ...(options.startFromWorkspaceId
          ? { id: MoreThanOrEqual(options.startFromWorkspaceId) }
          : {}),
        ...(isDefined(shard)
          ? {
              id: Raw(
                (alias) =>
                  `mod(get_byte(uuid_send(${alias}), 0), :shardTotal) = :shardIndex`,
                { shardTotal: shard.total, shardIndex: shard.index },
              ),
            }
          : {}),
      },
      order: { id: 'ASC' },
      take: options.workspaceCountLimit,
    });

    return workspaces.map((workspace) => workspace.id);
  }
}
