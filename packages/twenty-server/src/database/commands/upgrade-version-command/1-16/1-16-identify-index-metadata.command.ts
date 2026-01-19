import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';

import { STANDARD_INDEX_FIELD_UNIVERSAL_IDENTIFIERS } from './constants/standard-index-field-names.constant';

type StandardIndexUpdate = {
  flatIndexMetadata: FlatIndexMetadata;
  universalIdentifier: string;
  objectNameSingular: string;
  indexName: string;
};

@Command({
  name: 'upgrade:1-16:identify-index-metadata',
  description: 'Identify standard index metadata',
})
export class IdentifyIndexMetadataCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(IndexMetadataEntity)
    private readonly indexMetadataRepository: Repository<IndexMetadataEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    protected readonly applicationService: ApplicationService,
    protected readonly workspaceCacheService: WorkspaceCacheService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running identify standard index metadata for workspace ${workspaceId}`,
    );

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatObjectMetadataMaps',
            'flatFieldMetadataMaps',
            'flatIndexMaps',
          ],
        },
      );

    await this.identifyStandardIndexesOrThrow({
      workspaceId,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      twentyStandardApplicationId: twentyStandardFlatApplication.id,
      dryRun: options.dryRun ?? false,
    });

    await this.identifyCustomIndexes({
      workspaceId,
      flatObjectMetadataMaps,
      workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
      dryRun: options.dryRun ?? false,
    });

    const relatedMetadataNames = getMetadataRelatedMetadataNames('index');
    const relatedCacheKeysToInvalidate = relatedMetadataNames.map(
      getMetadataFlatEntityMapsKey,
    );

    this.logger.log(
      `Invalidating caches: ${relatedCacheKeysToInvalidate.join(' ')}`,
    );
    if (!options.dryRun) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatIndexMaps',
        ...relatedCacheKeysToInvalidate,
      ]);
    }
  }

  private async identifyStandardIndexesOrThrow({
    workspaceId,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatIndexMaps,
    twentyStandardApplicationId,
    dryRun,
  }: {
    workspaceId: string;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
    twentyStandardApplicationId: string;
    dryRun: boolean;
  }): Promise<void> {
    const standardIndexUpdates: StandardIndexUpdate[] = [];

    for (const [objectNameSingular, objectConfig] of Object.entries(
      STANDARD_OBJECTS,
    )) {
      const objectIndexes =
        'indexes' in objectConfig
          ? (objectConfig.indexes as Record<
              string,
              { universalIdentifier: string } | undefined
            >)
          : null;

      if (
        !isDefined(objectIndexes) ||
        Object.keys(objectIndexes).length === 0
      ) {
        continue;
      }

      const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: objectConfig.universalIdentifier,
      });

      if (!isDefined(flatObjectMetadata)) {
        this.logger.error(
          `Standard object "${objectNameSingular}" not found in workspace, this needs investigation, skipping`,
        );
        continue;
      }

      const objectFlatIndexMetadatas =
        findManyFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityIds: flatObjectMetadata.indexMetadataIds,
          flatEntityMaps: flatIndexMaps,
        });

      for (const [indexName, indexConfig] of Object.entries(objectIndexes)) {
        if (!isDefined(indexConfig)) {
          continue;
        }

        const indexUniversalIdentifier = indexConfig.universalIdentifier;

        if (!isDefined(indexUniversalIdentifier)) {
          this.logger.warn(
            `Index "${indexName}" config not found for object "${objectNameSingular}", skipping`,
          );
          continue;
        }

        const relatedFieldUniversalIdentifiers =
          STANDARD_INDEX_FIELD_UNIVERSAL_IDENTIFIERS[objectNameSingular]?.[
            indexName
          ];

        if (
          !isDefined(relatedFieldUniversalIdentifiers) ||
          relatedFieldUniversalIdentifiers.length === 0
        ) {
          this.logger.warn(
            `No field mapping found for index "${indexName}" on object "${objectNameSingular}", skipping`,
          );
          continue;
        }

        const expectedFlatFieldMetadatas = relatedFieldUniversalIdentifiers
          .map((fieldUniversalIdentifier) =>
            findFlatEntityByUniversalIdentifier({
              flatEntityMaps: flatFieldMetadataMaps,
              universalIdentifier: fieldUniversalIdentifier,
            }),
          )
          .filter(isDefined);

        if (
          expectedFlatFieldMetadatas.length !==
          relatedFieldUniversalIdentifiers.length
        ) {
          this.logger.warn(
            `Could not resolve all field metadata for index "${indexName}" on object "${objectNameSingular}", skipping`,
          );
          continue;
        }

        const expectedFieldMetadataIds = new Set(
          expectedFlatFieldMetadatas.map((flatField) => flatField.id),
        );
        const matchingFlatIndexMetadata = objectFlatIndexMetadatas.find(
          (flatIndex) => {
            const indexFieldMetadataIds = new Set(
              flatIndex.flatIndexFieldMetadatas.map(
                (indexField) => indexField.fieldMetadataId,
              ),
            );

            return this.setsEqual(
              indexFieldMetadataIds,
              expectedFieldMetadataIds,
            );
          },
        );

        if (!isDefined(matchingFlatIndexMetadata)) {
          this.logger.warn(
            `Could not find matching index for "${indexName}" on object "${objectNameSingular}", skipping`,
          );
          continue;
        }

        if (isDefined(matchingFlatIndexMetadata.applicationId)) {
          continue;
        }

        standardIndexUpdates.push({
          flatIndexMetadata: matchingFlatIndexMetadata,
          universalIdentifier: indexUniversalIdentifier,
          objectNameSingular: flatObjectMetadata.nameSingular,
          indexName,
        });
      }
    }

    const standardUpdates = standardIndexUpdates.map(
      ({ flatIndexMetadata, universalIdentifier }) => ({
        id: flatIndexMetadata.id,
        universalIdentifier,
        applicationId: twentyStandardApplicationId,
      }),
    );

    this.logger.log(
      `Found ${standardUpdates.length} standard index(es) to update for workspace ${workspaceId}`,
    );

    for (const {
      flatIndexMetadata,
      universalIdentifier,
      objectNameSingular,
      indexName,
    } of standardIndexUpdates) {
      this.logger.log(
        `  - Standard index "${indexName}" on object "${objectNameSingular}" (id=${flatIndexMetadata.id}) -> universalIdentifier=${universalIdentifier}`,
      );
    }

    if (!dryRun) {
      await this.indexMetadataRepository.save(standardUpdates);
    }
  }

  private async identifyCustomIndexes({
    workspaceId,
    flatObjectMetadataMaps,
    workspaceCustomApplicationId,
    dryRun,
  }: {
    workspaceId: string;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    workspaceCustomApplicationId: string;
    dryRun: boolean;
  }): Promise<void> {
    const remainingCustomIndexes = await this.indexMetadataRepository.find({
      select: {
        id: true,
        universalIdentifier: true,
        applicationId: true,
        name: true,
        objectMetadataId: true,
      },
      where: {
        workspaceId,
        applicationId: IsNull(),
      },
    });

    const customUpdates = remainingCustomIndexes.map((indexEntity) => ({
      id: indexEntity.id,
      universalIdentifier: indexEntity.universalIdentifier ?? v4(),
      applicationId: workspaceCustomApplicationId,
    }));

    this.logger.log(
      `Found ${customUpdates.length} custom index(es) to update for workspace ${workspaceId}`,
    );

    for (const indexEntity of remainingCustomIndexes) {
      const flatObjectMetadata =
        flatObjectMetadataMaps.byId[indexEntity.objectMetadataId];

      this.logger.log(
        `  - Custom index "${indexEntity.name}" on object "${flatObjectMetadata?.nameSingular ?? 'unknown'}" (id=${indexEntity.id})`,
      );
    }

    if (!dryRun) {
      await this.indexMetadataRepository.save(customUpdates);
    }
  }

  private setsEqual(a: Set<string>, b: Set<string>): boolean {
    if (a.size !== b.size) {
      return false;
    }

    for (const value of a) {
      if (!b.has(value)) {
        return false;
      }
    }

    return true;
  }
}
