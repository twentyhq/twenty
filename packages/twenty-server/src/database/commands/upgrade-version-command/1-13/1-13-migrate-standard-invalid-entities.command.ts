import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { type Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import { isDefined } from 'twenty-shared/utils';

@Command({
  name: 'upgrade:1-13:migrate-standard-invalid-entities',
  description: 'Migrate standard invalid entities',
})
export class MigrateStandardInvalidEntitiesCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly fieldMetadataService: FieldMetadataService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    options,
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun || false;

    this.logger.log(
      `MigrateStandardInvalidEntitiesCommand starting for workspace ${workspaceId}`,
    );
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const iCalUidFieldId =
      flatFieldMetadataMaps.idByUniversalIdentifier[
        STANDARD_OBJECTS.calendarEvent.fields.iCalUid.universalIdentifier
      ];

    if (!isDefined(iCalUidFieldId)) {
      throw new Error(
        `Could not find caldavuid id for workspace ${workspaceId}`,
      );
    }

    if (isDryRun) {
      return;
    }

    await this.fieldMetadataService.updateOneField({
      updateFieldInput: {
        id: iCalUidFieldId,
        name: 'iCalUid',
      },
      workspaceId,
      isSystemBuild: true,
    });

    this.logger.log('Migrated standard invalid entities');
  }
}
