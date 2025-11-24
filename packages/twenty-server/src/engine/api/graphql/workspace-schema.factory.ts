import { Injectable } from '@nestjs/common';

import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLSchema, printSchema } from 'graphql';
import { gql } from 'graphql-tag';
import { isDefined } from 'twenty-shared/utils';

import { ScalarsExplorerService } from 'src/engine/api/graphql/services/scalars-explorer.service';
import { workspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/factories/factories';
import { WorkspaceResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/workspace-resolver.factory';
import { WorkspaceGraphQLSchemaGenerator } from 'src/engine/api/graphql/workspace-schema-builder/workspace-graphql-schema.factory';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { buildObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-metadata-item-with-field-maps.util';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { standardObjectMetadataDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects';
import { shouldExcludeFromWorkspaceApi } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/should-exclude-from-workspace-api.util';

@Injectable()
export class WorkspaceSchemaFactory {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly scalarsExplorerService: ScalarsExplorerService,
    private readonly workspaceGraphQLSchemaGenerator: WorkspaceGraphQLSchemaGenerator,
    private readonly workspaceResolverFactory: WorkspaceResolverFactory,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async createGraphQLSchema(authContext: AuthContext): Promise<GraphQLSchema> {
    if (!authContext.workspace?.id) {
      return new GraphQLSchema({});
    }

    const dataSourcesMetadata =
      await this.dataSourceService.getDataSourcesMetadataFromWorkspaceId(
        authContext.workspace.id,
      );

    if (!dataSourcesMetadata || dataSourcesMetadata.length === 0) {
      return new GraphQLSchema({});
    }

    const workspaceId = authContext.workspace.id;

    if (!workspaceId) {
      throw new AuthException(
        'Unauthenticated',
        AuthExceptionCode.UNAUTHENTICATED,
      );
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatObjectMetadataMaps',
            'flatFieldMetadataMaps',
            'flatIndexMaps',
          ],
        },
      );

    if (!isDefined(flatObjectMetadataMaps)) {
      throw new FlatEntityMapsException(
        'Object metadata collection not found',
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    const workspaceFeatureFlagsMap =
      await this.featureFlagService.getWorkspaceFeatureFlagsMap(workspaceId);

    let metadataVersion =
      await this.workspaceCacheStorageService.getMetadataVersion(workspaceId);

    if (!isDefined(metadataVersion)) {
      metadataVersion = authContext.workspace.metadataVersion ?? 0;
      await this.workspaceCacheStorageService.setMetadataVersion(
        workspaceId,
        metadataVersion,
      );
    }

    const { idByNameSingular } = buildObjectIdByNameMaps(
      flatObjectMetadataMaps,
    );
    const objectMetadataMaps: ObjectMetadataMaps = {
      byId: {},
      idByNameSingular,
    };

    for (const [id, flatObj] of Object.entries(flatObjectMetadataMaps.byId)) {
      if (isDefined(flatObj)) {
        objectMetadataMaps.byId[id] = buildObjectMetadataItemWithFieldMaps(
          flatObj,
          flatFieldMetadataMaps,
          flatIndexMaps,
        );
      }
    }

    const objectMetadataCollection = Object.values(objectMetadataMaps.byId)
      .filter(isDefined)
      .map((objectMetadataItem) => ({
        ...objectMetadataItem,
        fields: Object.values(objectMetadataItem.fieldsById),
        indexes: objectMetadataItem.indexMetadatas,
      }))
      .filter((objectMetadata) => {
        return !shouldExcludeFromWorkspaceApi(
          objectMetadata,
          standardObjectMetadataDefinitions,
          workspaceFeatureFlagsMap,
        );
      });

    // Get typeDefs from cache
    let typeDefs = await this.workspaceCacheStorageService.getGraphQLTypeDefs(
      authContext.workspace.id,
      metadataVersion,
    );
    let usedScalarNames =
      await this.workspaceCacheStorageService.getGraphQLUsedScalarNames(
        authContext.workspace.id,
        metadataVersion,
      );

    // If typeDefs are not cached, generate them
    if (!typeDefs || !usedScalarNames) {
      const autoGeneratedSchema =
        await this.workspaceGraphQLSchemaGenerator.generateSchema(
          objectMetadataCollection,
        );

      usedScalarNames =
        this.scalarsExplorerService.getUsedScalarNames(autoGeneratedSchema);
      typeDefs = printSchema(autoGeneratedSchema);

      await this.workspaceCacheStorageService.setGraphQLTypeDefs(
        authContext.workspace.id,
        metadataVersion,
        typeDefs,
      );
      await this.workspaceCacheStorageService.setGraphQLUsedScalarNames(
        authContext.workspace.id,
        metadataVersion,
        usedScalarNames,
      );
    }

    const autoGeneratedResolvers = await this.workspaceResolverFactory.create(
      authContext,
      objectMetadataMaps,
      workspaceResolverBuilderMethodNames,
    );
    const scalarsResolvers =
      this.scalarsExplorerService.getScalarResolvers(usedScalarNames);

    const executableSchema = makeExecutableSchema({
      typeDefs: gql`
        ${typeDefs}
      `,
      resolvers: {
        ...scalarsResolvers,
        ...autoGeneratedResolvers,
      },
    });

    return executableSchema;
  }
}
