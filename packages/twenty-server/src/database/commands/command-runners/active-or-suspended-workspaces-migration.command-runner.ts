import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { type Repository } from 'typeorm';

import {
  WorkspacesMigrationCommandRunner,
  type WorkspacesMigrationCommandOptions,
} from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { type TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

export type ActiveOrSuspendedWorkspacesMigrationCommandOptions =
  WorkspacesMigrationCommandOptions;

// Convenience class that extends the generic base with ACTIVE and SUSPENDED statuses
export abstract class ActiveOrSuspendedWorkspacesMigrationCommandRunner<
  Options extends
    ActiveOrSuspendedWorkspacesMigrationCommandOptions = ActiveOrSuspendedWorkspacesMigrationCommandOptions,
> extends WorkspacesMigrationCommandRunner<Options> {
  constructor(
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly dataSourceService: DataSourceService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService, [
      WorkspaceActivationStatus.ACTIVE,
      WorkspaceActivationStatus.SUSPENDED,
    ]);
  }
}
