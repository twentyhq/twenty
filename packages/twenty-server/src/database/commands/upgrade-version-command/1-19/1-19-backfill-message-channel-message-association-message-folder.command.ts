import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps-or-throw.util';
import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const OBJECT_UNIVERSAL_IDENTIFIER_TO_CREATE =
  STANDARD_OBJECTS.messageChannelMessageAssociationMessageFolder
    .universalIdentifier;
const FIELD_UNIVERSAL_IDENTIFIERS_TO_CREATE = Object.values(
  STANDARD_OBJECTS.messageChannelMessageAssociationMessageFolder.fields,
).map((el) => el.universalIdentifier);

@Command({
  name: 'upgrade:1-19:backfill-message-channel-message-association-message-folder',
  description:
    'Backfill messageChannelMessageAssociationMessageFolder standard object and its relation fields',
})
export class BackfillMessageChannelMessageAssociationMessageFolderCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Starting backfill of messageChannelMessageAssociationMessageFolder for workspace ${workspaceId}`,
    );

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const existingObject = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatObjectMetadataMaps,
      universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER_TO_CREATE,
    });

    if (existingObject) {
      this.logger.log(
        `messageChannelMessageAssociationMessageFolder object already exists for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create messageChannelMessageAssociationMessageFolder object and relation fields for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const flatObjectMetadataToCreate =
      findFlatEntityByUniversalIdentifierOrThrow({
        flatEntityMaps: standardAllFlatEntityMaps.flatObjectMetadataMaps,
        universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER_TO_CREATE,
      });

    const flatFieldMetadataToCreateOnObject =
      findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow({
        flatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
        universalIdentifiers: FIELD_UNIVERSAL_IDENTIFIERS_TO_CREATE,
      });
    const relatedFlatFieldMetadataToCreate = flatFieldMetadataToCreateOnObject
      .map((flatFieldMetadata) => {
        if (!isMorphOrRelationUniversalFlatFieldMetadata(flatFieldMetadata)) {
          return undefined;
        }

        return findFlatEntityByUniversalIdentifierOrThrow({
          flatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
          universalIdentifier:
            flatFieldMetadata.relationTargetFieldMetadataUniversalIdentifier,
        });
      })
      .filter(isDefined);

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            objectMetadata: {
              flatEntityToCreate: [flatObjectMetadataToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            fieldMetadata: {
              flatEntityToCreate: [
                ...flatFieldMetadataToCreateOnObject,
                ...relatedFlatFieldMetadataToCreate,
              ],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to create messageChannelMessageAssociationMessageFolder:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );
      throw new Error(
        `Failed to create messageChannelMessageAssociationMessageFolder for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully created messageChannelMessageAssociationMessageFolder for workspace ${workspaceId}`,
    );
  }
}
