import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { type Repository } from 'typeorm';

import {
  WorkspacesMigrationCommandRunner,
  type WorkspacesMigrationCommandOptions,
} from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { type GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

export type ActiveOrSuspendedWorkspacesMigrationCommandOptions =
  WorkspacesMigrationCommandOptions;

export abstract class ActiveOrSuspendedWorkspacesMigrationCommandRunner<
  Options extends
    ActiveOrSuspendedWorkspacesMigrationCommandOptions = ActiveOrSuspendedWorkspacesMigrationCommandOptions,
> extends WorkspacesMigrationCommandRunner<Options> {
  constructor(
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService, [
      WorkspaceActivationStatus.ACTIVE,
      WorkspaceActivationStatus.SUSPENDED,
    ]);
  }
}
