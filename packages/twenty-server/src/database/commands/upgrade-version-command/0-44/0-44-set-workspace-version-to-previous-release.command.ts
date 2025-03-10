import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: 'upgrade:0-44-set-workspace-version-to-previous-release',
  description: 'Migrate relations to field metadata',
})
export class MigrateRelationsToFieldMetadataCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly environmentService: EnvironmentService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, environmentService);
  }

  override async runOnWorkspace({
    index,
    total,
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running command for workspace ${workspaceId} ${index + 1}/${total}`,
    );

    const currentAppVersion = this.environmentService.get('APP_VERSION');
    await this.workspaceRepository.update(
      { id: workspaceId },
      { version: '0.43' },
    );
  }
}
