import { Injectable } from '@nestjs/common';

import { makeExecutableSchema } from '@graphql-tools/schema';
import chalk from 'chalk';
import { GraphQLSchema, printSchema } from 'graphql';
import { gql } from 'graphql-tag';
import { isDefined } from 'twenty-shared/utils';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { ScalarsExplorerService } from 'src/engine/api/graphql/services/scalars-explorer.service';
import { workspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/factories/factories';
import { WorkspaceResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/workspace-resolver.factory';
import { WorkspaceGraphQLSchemaFactory } from 'src/engine/api/graphql/workspace-schema-builder/workspace-graphql-schema.factory';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

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
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async createGraphQLSchema(authContext: AuthContext): Promise<GraphQLSchema> {
    if (!authContext.workspace?.id) {
      return new GraphQLSchema({});
    }

    const isNewRelationEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IsNewRelationEnabled,
      authContext.workspace.id,
    );

    if (
      isNewRelationEnabled &&
      this.twentyConfigService.get('NODE_ENV') !== NodeEnvironment.test
    ) {
      // eslint-disable-next-line no-console
      console.log(
        chalk.yellow('🚧 New relation schema generation is enabled 🚧'),
      );
    }

    const dataSourcesMetadata =
      await this.dataSourceService.getDataSourcesMetadataFromWorkspaceId(
        authContext.workspace.id,
      );

    if (!dataSourcesMetadata || dataSourcesMetadata.length === 0) {
      return new GraphQLSchema({});
    }

    let currentCacheVersion =
      await this.workspaceCacheStorageService.getMetadataVersion(
        authContext.workspace.id,
      );

    let objectMetadataMaps: ObjectMetadataMaps | undefined;

    if (currentCacheVersion === undefined) {
      const recomputed =
        await this.workspaceMetadataCacheService.recomputeMetadataCache({
          workspaceId: authContext.workspace.id,
        });

      objectMetadataMaps = recomputed?.recomputedObjectMetadataMaps;
      currentCacheVersion = recomputed?.recomputedMetadataVersion;
    } else {
      objectMetadataMaps =
        await this.workspaceCacheStorageService.getObjectMetadataMaps(
          authContext.workspace.id,
          currentCacheVersion,
        );

      if (!isDefined(objectMetadataMaps)) {
        const recomputed =
          await this.workspaceMetadataCacheService.recomputeMetadataCache({
            workspaceId: authContext.workspace.id,
          });

        objectMetadataMaps = recomputed?.recomputedObjectMetadataMaps;
        currentCacheVersion = recomputed?.recomputedMetadataVersion;
      }
    }

    if (!objectMetadataMaps) {
      throw new GraphqlQueryRunnerException(
        'Object metadata collection not found',
        GraphqlQueryRunnerExceptionCode.OBJECT_METADATA_COLLECTION_NOT_FOUND,
      );
    }

    if (!currentCacheVersion) {
      throw new GraphqlQueryRunnerException(
        'Metadata cache version not found',
        GraphqlQueryRunnerExceptionCode.METADATA_CACHE_VERSION_NOT_FOUND,
      );
    }

    const objectMetadataCollection = Object.values(objectMetadataMaps.byId).map(
      (objectMetadataItem) => ({
        ...objectMetadataItem,
        fields: objectMetadataItem.fields,
        indexes: objectMetadataItem.indexMetadatas,
      }),
    );

    // Get typeDefs from cache
    let typeDefs = await this.workspaceCacheStorageService.getGraphQLTypeDefs(
      authContext.workspace.id,
      currentCacheVersion,
    );
    let usedScalarNames =
      await this.workspaceCacheStorageService.getGraphQLUsedScalarNames(
        authContext.workspace.id,
        currentCacheVersion,
      );

    // If typeDefs are not cached, generate them
    if (!typeDefs || !usedScalarNames) {
      const autoGeneratedSchema =
        await this.workspaceGraphQLSchemaFactory.create(
          objectMetadataCollection,
          workspaceResolverBuilderMethodNames,
          {},
          isNewRelationEnabled,
        );

      usedScalarNames =
        this.scalarsExplorerService.getUsedScalarNames(autoGeneratedSchema);
      typeDefs = printSchema(autoGeneratedSchema);

      await this.workspaceCacheStorageService.setGraphQLTypeDefs(
        authContext.workspace.id,
        currentCacheVersion,
        typeDefs,
      );
      await this.workspaceCacheStorageService.setGraphQLUsedScalarNames(
        authContext.workspace.id,
        currentCacheVersion,
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
