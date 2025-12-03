import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

const FEATURE_FLAG_KEY_TO_REMOVE = 'IS_WORKSPACE_MIGRATION_V2_ENABLED';

@Command({
  name: 'upgrade:1-13:remove-is-workspace-migration-v2-enabled-feature-flag',
  description:
    'Remove the IS_WORKSPACE_MIGRATION_V2_ENABLED feature flag from workspaces',
})
export class RemoveIsWorkspaceMigrationV2EnabledFeatureFlagCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(
    RemoveIsWorkspaceMigrationV2EnabledFeatureFlagCommand.name,
  );

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(FeatureFlagEntity)
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly dataSourceService: DataSourceService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const featureFlag = await this.featureFlagRepository.findOne({
      where: {
        workspaceId,
        key: FEATURE_FLAG_KEY_TO_REMOVE as FeatureFlagKey,
      },
    });

    if (!featureFlag) {
      this.logger.log(
        `Feature flag ${FEATURE_FLAG_KEY_TO_REMOVE} not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would delete feature flag ${FEATURE_FLAG_KEY_TO_REMOVE} (id: ${featureFlag.id}) for workspace ${workspaceId}`,
      );

      return;
    }

    await this.featureFlagRepository.delete({ id: featureFlag.id });

    this.logger.log(
      `Deleted feature flag ${FEATURE_FLAG_KEY_TO_REMOVE} (id: ${featureFlag.id}) for workspace ${workspaceId}`,
    );
  }
}
