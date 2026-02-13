import { Injectable } from '@nestjs/common';

import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLSchema, printSchema } from 'graphql';
import { gql } from 'graphql-tag';
import { isDefined } from 'twenty-shared/utils';

import { ScalarsExplorerService } from 'src/engine/api/graphql/services/scalars-explorer.service';
import { workspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/factories/factories';
import { WorkspaceResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/workspace-resolver.factory';
import { WorkspaceGraphQLSchemaGenerator } from 'src/engine/api/graphql/workspace-schema-builder/workspace-graphql-schema.factory';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getSubFlatEntityMapsByApplicationIdsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-flat-entity-maps-by-application-ids-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

@Injectable()
export class WorkspaceSchemaFactory {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly scalarsExplorerService: ScalarsExplorerService,
    private readonly workspaceGraphQLSchemaGenerator: WorkspaceGraphQLSchemaGenerator,
    private readonly workspaceResolverFactory: WorkspaceResolverFactory,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async createGraphQLSchema(
    workspace: WorkspaceEntity,
    applicationId?: string,
  ): Promise<GraphQLSchema> {
    const dataSourcesMetadata =
      await this.dataSourceService.getDataSourcesMetadataFromWorkspaceId(
        workspace.id,
      );

    if (!dataSourcesMetadata || dataSourcesMetadata.length === 0) {
      return new GraphQLSchema({});
    }

    const {
      flatObjectMetadataMaps: allFlatObjectMetadataMaps,
      flatFieldMetadataMaps: allFlatFieldMetadataMaps,
      flatIndexMaps: allFlatIndexMaps,
      flatApplicationMaps,
    } = await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId: workspace.id,
        flatMapsKeys: [
          'flatObjectMetadataMaps',
          'flatFieldMetadataMaps',
          'flatIndexMaps',
          'flatApplicationMaps',
        ],
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

      flatObjectMetadataMaps = this.filterFlatEntityMapsByApplicationIds(
        allFlatObjectMetadataMaps,
        applicationIds,
      );
      flatFieldMetadataMaps = this.filterFlatEntityMapsByApplicationIds(
        allFlatFieldMetadataMaps,
        applicationIds,
      );

      flatObjectMetadataMaps =
        this.reconcileObjectFieldIdsWithFilteredFieldMaps(
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        );

      if (isDefined(allFlatIndexMaps)) {
        flatIndexMaps = this.filterFlatEntityMapsByApplicationIds(
          allFlatIndexMaps,
          applicationIds,
        );
      }
    }

    let metadataVersion =
      await this.workspaceCacheStorageService.getMetadataVersion(workspace.id);

    if (!isDefined(metadataVersion)) {
      metadataVersion = isDefined(workspace.metadataVersion)
        ? workspace.metadataVersion
        : 0;
      await this.workspaceCacheStorageService.setMetadataVersion(
        workspace.id,
        metadataVersion,
      );
    }

    const { idByNameSingular } = buildObjectIdByNameMaps(
      flatObjectMetadataMaps,
    );

    let typeDefs = await this.workspaceCacheStorageService.getGraphQLTypeDefs(
      workspace.id,
      metadataVersion,
      applicationId,
    );
    let usedScalarNames =
      await this.workspaceCacheStorageService.getGraphQLUsedScalarNames(
        workspace.id,
        metadataVersion,
        applicationId,
      );

    if (!typeDefs || !usedScalarNames) {
      const autoGeneratedSchema =
        await this.workspaceGraphQLSchemaGenerator.generateSchema({
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          flatIndexMaps,
        });

      usedScalarNames =
        this.scalarsExplorerService.getUsedScalarNames(autoGeneratedSchema);
      typeDefs = printSchema(autoGeneratedSchema);

      await this.workspaceCacheStorageService.setGraphQLTypeDefs(
        workspace.id,
        metadataVersion,
        typeDefs,
        applicationId,
      );
      await this.workspaceCacheStorageService.setGraphQLUsedScalarNames(
        workspace.id,
        metadataVersion,
        usedScalarNames,
        applicationId,
      );
    }

    const autoGeneratedResolvers = await this.workspaceResolverFactory.create(
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      idByNameSingular,
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

  private filterFlatEntityMapsByApplicationIds<
    T extends FlatObjectMetadata | FlatFieldMetadata | FlatIndexMetadata,
  >(
    flatEntityMaps: FlatEntityMaps<T>,
    applicationIds: string[],
  ): FlatEntityMaps<T> {
    return getSubFlatEntityMapsByApplicationIdsOrThrow({
      applicationIds,
      flatEntityMaps,
    });
  }
}
