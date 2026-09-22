import { Inject, Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { printSchema } from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { ScalarsExplorerService } from 'src/engine/api/graphql/services/scalars-explorer.service';
import { CORE_WORKFLOW_APP_OPERATIONS_SDL_APPENDER } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/core-workflow-app-operations-sdl.constants';
import { type CoreWorkflowAppOperationsSdlAppender } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/types/core-workflow-app-operations-sdl-appender.type';
import { computeSchemaScopeFlatEntityIds } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/utils/compute-schema-scope-flat-entity-ids.util';
import { type SchemaGenerationContext } from 'src/engine/api/graphql/workspace-schema-builder/types/schema-generation-context.type';
import { WorkspaceGraphQLSchemaGenerator } from 'src/engine/api/graphql/workspace-schema-builder/workspace-graphql-schema.factory';
import { FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { getSubFlatEntityByIdsMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-flat-entity-by-ids-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { SCHEMA_SDL_CACHE_DEPENDENCIES } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/constants/schema-sdl-cache-dependencies.constant';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { combineCacheHashes } from 'src/engine/workspace-cache/utils/combine-cache-hashes.util';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

export type WorkspaceGraphqlSchemaSDLResult = {
  sdl: string;
  usedScalarNames: string[];
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
};

@Injectable()
export class WorkspaceGraphqlSchemaSDLService {
  constructor(
    private readonly scalarsExplorerService: ScalarsExplorerService,
    private readonly workspaceGraphQLSchemaGenerator: WorkspaceGraphQLSchemaGenerator,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    @Inject(CORE_WORKFLOW_APP_OPERATIONS_SDL_APPENDER)
    private readonly appendCoreWorkflowAppOperationsToSdl: CoreWorkflowAppOperationsSdlAppender,
  ) {}

  async getOrComputeSchemaSDL(
    workspace: FlatWorkspace,
    applicationId?: string,
  ): Promise<WorkspaceGraphqlSchemaSDLResult | null> {
    if (!isNonEmptyString(workspace.databaseSchema)) {
      return null;
    }

    const {
      data: {
        flatObjectMetadataMaps: allFlatObjectMetadataMaps,
        flatFieldMetadataMaps: allFlatFieldMetadataMaps,
        flatIndexMaps: allFlatIndexMaps,
        flatApplicationMaps,
      },
      hashes,
    } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMapsWithHashes(
        {
          workspaceId: workspace.id,
          flatMapsKeys: [...SCHEMA_SDL_CACHE_DEPENDENCIES],
        },
      );

    if (!isDefined(allFlatObjectMetadataMaps)) {
      throw new FlatEntityMapsException(
        'Object metadata collection not found',
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    if (!isDefined(allFlatFieldMetadataMaps)) {
      throw new FlatEntityMapsException(
        'Field metadata collection not found',
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    let flatObjectMetadataMaps = allFlatObjectMetadataMaps;
    let flatFieldMetadataMaps = allFlatFieldMetadataMaps;
    let flatIndexMaps = allFlatIndexMaps;

    if (isDefined(applicationId)) {
      const twentyStandardApplicationId =
        flatApplicationMaps?.idByUniversalIdentifier[
          TWENTY_STANDARD_APPLICATION.universalIdentifier
        ];

      const applicationIds = isDefined(twentyStandardApplicationId)
        ? [twentyStandardApplicationId, applicationId]
        : [applicationId];

      const { flatObjectMetadataIds, flatFieldMetadataIds } =
        computeSchemaScopeFlatEntityIds({
          applicationIds,
          flatObjectMetadataMaps: allFlatObjectMetadataMaps,
          flatFieldMetadataMaps: allFlatFieldMetadataMaps,
        });

      flatObjectMetadataMaps = getSubFlatEntityByIdsMapsOrThrow({
        flatEntityIds: flatObjectMetadataIds,
        flatEntityMaps: allFlatObjectMetadataMaps,
      });
      flatFieldMetadataMaps = getSubFlatEntityByIdsMapsOrThrow({
        flatEntityIds: flatFieldMetadataIds,
        flatEntityMaps: allFlatFieldMetadataMaps,
      });

      if (isDefined(allFlatIndexMaps)) {
        flatIndexMaps = getSubFlatEntityByIdsMapsOrThrow({
          flatEntityIds: this.computeScopeFlatIndexIds({
            flatObjectMetadataMaps,
            flatIndexMaps: allFlatIndexMaps,
            applicationIds,
          }),
          flatEntityMaps: allFlatIndexMaps,
        });
      }

      flatObjectMetadataMaps =
        this.reconcileObjectFieldIdsWithFilteredFieldMaps(
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        );
    }

    const metadataCacheHash = combineCacheHashes(
      hashes,
      SCHEMA_SDL_CACHE_DEPENDENCIES,
    );

    const [cachedSdl, cachedUsedScalarNames] = await Promise.all([
      this.workspaceCacheStorageService.getGraphQLTypeDefs(
        workspace.id,
        metadataCacheHash,
        applicationId,
      ),
      this.workspaceCacheStorageService.getGraphQLUsedScalarNames(
        workspace.id,
        metadataCacheHash,
        applicationId,
      ),
    ]);

    const { sdl, usedScalarNames } =
      isNonEmptyString(cachedSdl) && isDefined(cachedUsedScalarNames)
        ? { sdl: cachedSdl, usedScalarNames: cachedUsedScalarNames }
        : await this.computeAndCacheSchemaSDL({
            workspaceId: workspace.id,
            metadataCacheHash,
            applicationId,
            schemaGenerationContext: {
              flatObjectMetadataMaps,
              flatFieldMetadataMaps,
              flatIndexMaps,
            },
          });

    return {
      sdl: isDefined(applicationId)
        ? await this.appendCoreWorkflowAppOperationsToSdl(sdl)
        : sdl,
      usedScalarNames,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
    };
  }

  private async computeAndCacheSchemaSDL({
    workspaceId,
    metadataCacheHash,
    applicationId,
    schemaGenerationContext,
  }: {
    workspaceId: string;
    metadataCacheHash: string;
    applicationId?: string;
    schemaGenerationContext: SchemaGenerationContext;
  }): Promise<{ sdl: string; usedScalarNames: string[] }> {
    const autoGeneratedSchema =
      await this.workspaceGraphQLSchemaGenerator.generateSchema(
        schemaGenerationContext,
      );

    const usedScalarNames =
      this.scalarsExplorerService.getUsedScalarNames(autoGeneratedSchema);
    const sdl = printSchema(autoGeneratedSchema);

    await Promise.all([
      this.workspaceCacheStorageService.setGraphQLTypeDefs(
        workspaceId,
        metadataCacheHash,
        sdl,
        applicationId,
      ),
      this.workspaceCacheStorageService.setGraphQLUsedScalarNames(
        workspaceId,
        metadataCacheHash,
        usedScalarNames,
        applicationId,
      ),
    ]);

    return { sdl, usedScalarNames };
  }

  private reconcileObjectFieldIdsWithFilteredFieldMaps(
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ): FlatEntityMaps<FlatObjectMetadata> {
    const filteredFieldIds = new Set(
      Object.keys(flatFieldMetadataMaps.universalIdentifierById),
    );

    const reconciledByUniversalIdentifier: Partial<
      Record<string, FlatObjectMetadata>
    > = {};

    for (const [universalId, object] of Object.entries(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(object)) continue;

      reconciledByUniversalIdentifier[universalId] = {
        ...object,
        fieldIds: object.fieldIds.filter((id) => filteredFieldIds.has(id)),
      };
    }

    return {
      ...flatObjectMetadataMaps,
      byUniversalIdentifier: reconciledByUniversalIdentifier,
    };
  }

  private computeScopeFlatIndexIds({
    flatObjectMetadataMaps,
    flatIndexMaps,
    applicationIds,
  }: {
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
    applicationIds: string[];
  }): string[] {
    return Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .flatMap((flatObjectMetadata) =>
        findManyFlatEntityByIdInFlatEntityMaps({
          flatEntityIds: flatObjectMetadata.indexMetadataIds,
          flatEntityMaps: flatIndexMaps,
        })
          .filter(
            (flatIndexMetadata) =>
              applicationIds.includes(flatIndexMetadata.applicationId) ||
              flatIndexMetadata.applicationId ===
                flatObjectMetadata.applicationId,
          )
          .map((flatIndexMetadata) => flatIndexMetadata.id),
      );
  }
}
