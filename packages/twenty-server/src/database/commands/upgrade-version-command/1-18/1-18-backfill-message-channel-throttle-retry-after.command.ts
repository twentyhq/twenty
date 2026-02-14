import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Command({
  name: 'upgrade:1-18:backfill-message-channel-throttle-retry-after',
  description:
    'Backfill throttleRetryAfter field on messageChannel standard object',
})
export class BackfillMessageChannelThrottleRetryAfterCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly applicationService: ApplicationService,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Backfilling throttleRetryAfter field for workspace ${workspaceId}`,
    );

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const messageChannelObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier:
          STANDARD_OBJECTS.messageChannel.universalIdentifier,
      });

    if (!messageChannelObjectMetadata) {
      this.logger.log(
        `MessageChannel object metadata not found for workspace ${workspaceId}. Skipping.`,
      );

      return;
    }

    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const existingField = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatFieldMetadataMaps,
      universalIdentifier:
        STANDARD_OBJECTS.messageChannel.fields.throttleRetryAfter
          .universalIdentifier,
    });

    if (existingField) {
      this.logger.log(
        `throttleRetryAfter field already exists for workspace ${workspaceId}. Skipping.`,
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `Would have created throttleRetryAfter field for workspace ${workspaceId}. Skipping (dry run).`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    await this.fieldMetadataService.createOneField({
      createFieldInput: {
        name: 'throttleRetryAfter',
        type: FieldMetadataType.DATE_TIME,
        label: 'Throttle Retry After',
        description: 'Throttle Retry After',
        icon: 'IconClock',
        isNullable: true,
        isUIReadOnly: true,
        objectMetadataId: messageChannelObjectMetadata.id,
        universalIdentifier:
          STANDARD_OBJECTS.messageChannel.fields.throttleRetryAfter
            .universalIdentifier,
      },
      workspaceId,
      ownerFlatApplication: twentyStandardFlatApplication,
    });

    this.logger.log(
      `Successfully created throttleRetryAfter field for workspace ${workspaceId}`,
    );
  }
}
