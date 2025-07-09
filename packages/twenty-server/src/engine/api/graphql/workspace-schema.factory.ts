import { Injectable } from '@nestjs/common';

import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLSchema, printSchema } from 'graphql';
import { gql } from 'graphql-tag';
import { isDefined } from 'twenty-shared/utils';

import { ScalarsExplorerService } from 'src/engine/api/graphql/services/scalars-explorer.service';
import { workspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/factories/factories';
import { WorkspaceResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/workspace-resolver.factory';
import { WorkspaceGraphQLSchemaFactory } from 'src/engine/api/graphql/workspace-schema-builder/workspace-graphql-schema.factory';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import {
  WorkspaceMetadataCacheException,
  WorkspaceMetadataCacheExceptionCode,
} from 'src/engine/metadata-modules/workspace-metadata-cache/exceptions/workspace-metadata-cache.exception';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { standardObjectMetadataDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects';
import { isGatedAndNotEnabled } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/is-gate-and-not-enabled.util';

@Injectable()
export class WorkspaceSchemaFactory {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly scalarsExplorerService: ScalarsExplorerService,
    private readonly workspaceGraphQLSchemaFactory: WorkspaceGraphQLSchemaFactory,
    private readonly workspaceResolverFactory: WorkspaceResolverFactory,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
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

    const { objectMetadataMaps, metadataVersion } =
      await this.workspaceMetadataCacheService.getExistingOrRecomputeMetadataMaps(
        {
          workspaceId: authContext.workspace.id,
        },
      );

    if (!objectMetadataMaps) {
      throw new WorkspaceMetadataCacheException(
        'Object metadata collection not found',
        WorkspaceMetadataCacheExceptionCode.OBJECT_METADATA_COLLECTION_NOT_FOUND,
      );
    }

    const workspaceId = authContext.workspace.id;

    if (!workspaceId) {
      throw new AuthException(
        'Unauthenticated',
        AuthExceptionCode.UNAUTHENTICATED,
      );
    }

    const workspaceFeatureFlagsMap =
      await this.featureFlagService.getWorkspaceFeatureFlagsMap(workspaceId);

    const objectMetadataCollection = Object.values(objectMetadataMaps.byId)
      .filter(isDefined)
      .map((objectMetadataItem) => ({
        ...objectMetadataItem,
        fields: Object.values(objectMetadataItem.fieldsById),
        indexes: objectMetadataItem.indexMetadatas,
      }))
      .filter((objectMetadata) => {
        // Find the corresponding workspace entity for this object metadata
        const workspaceEntity = standardObjectMetadataDefinitions.find(
          (entity) => {
            const entityMetadata = metadataArgsStorage.filterEntities(entity);

            return entityMetadata?.standardId === objectMetadata.standardId;
          },
        );

        if (!workspaceEntity) {
          return true; // Include non-workspace entities (custom objects, etc.)
        }

        const entityMetadata =
          metadataArgsStorage.filterEntities(workspaceEntity);

        // Filter out entities that are GraphQL-gated and not enabled
        return !isGatedAndNotEnabled(
          entityMetadata?.gate,
          workspaceFeatureFlagsMap,
          'graphql',
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
        await this.workspaceGraphQLSchemaFactory.create(
          objectMetadataCollection,
          workspaceResolverBuilderMethodNames,
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
