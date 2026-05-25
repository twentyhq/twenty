import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { isNonEmptyString } from '@sniptt/guards';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { isDefined } from 'twenty-shared/utils';
import { In, MoreThanOrEqual, Repository } from 'typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { GlobalWorkspaceDataSource } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceMigrationRunnerException } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

export type WorkspaceIteratorArgs = {
  workspaceIds?: string[];
  activationStatuses?: WorkspaceActivationStatus[];
  startFromWorkspaceId?: string;
  workspaceCountLimit?: number;
  dryRun?: boolean;
  callback: (context: WorkspaceIteratorContext) => Promise<void>;
};

export type WorkspaceIteratorContext = {
  workspaceId: string;
  dataSource?: GlobalWorkspaceDataSource;
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
};

const DEFAULT_ACTIVATION_STATUSES = [
  WorkspaceActivationStatus.ACTIVE,
  WorkspaceActivationStatus.SUSPENDED,
];

@Injectable()
export class WorkspaceIteratorService {
  private readonly logger = new Logger(WorkspaceIteratorService.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async iterate(args: WorkspaceIteratorArgs): Promise<WorkspaceIteratorReport> {
    const { callback, ...options } = args;

    const report: WorkspaceIteratorReport = {
      fail: [],
      success: [],
    };

    const workspaceIdsToProcess =
      options.workspaceIds && options.workspaceIds.length > 0
        ? options.workspaceIds
        : await this.fetchWorkspaceIds(options);

    if (options.dryRun) {
      this.logger.log(chalk.yellow('Dry run mode: No changes will be applied'));
    }

    for (const [index, workspaceId] of workspaceIdsToProcess.entries()) {
      this.logger.log(
        `Running on workspace ${workspaceId} ${index + 1}/${workspaceIdsToProcess.length}`,
      );

      try {
        const authContext = buildSystemAuthContext(workspaceId);

        await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
          async () => {
            const workspace = await this.workspaceRepository.findOne({
              select: ['databaseSchema'],
              where: { id: workspaceId },
            });

            const dataSource = isNonEmptyString(workspace?.databaseSchema)
              ? await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource()
              : undefined;

            await callback({
              workspaceId,
              dataSource,
              index,
              total: workspaceIdsToProcess.length,
            });
          },
          authContext,
        );

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
      'activationStatuses' | 'startFromWorkspaceId' | 'workspaceCountLimit'
    >,
  ): Promise<string[]> {
    const activationStatuses =
      options.activationStatuses ?? DEFAULT_ACTIVATION_STATUSES;

    const workspaces = await this.workspaceRepository.find({
      select: ['id'],
      where: {
        activationStatus: In(activationStatuses),
        ...(options.startFromWorkspaceId
          ? { id: MoreThanOrEqual(options.startFromWorkspaceId) }
          : {}),
      },
      order: { id: 'ASC' },
      take: options.workspaceCountLimit,
    });

    return workspaces.map((workspace) => workspace.id);
  }
}
