import { Injectable } from '@nestjs/common';

import {
  GraphqlQueryBaseResolverService,
  GraphqlQueryResolverExecutionArgs,
} from 'src/engine/api/graphql/graphql-query-runner/interfaces/base-resolver-service';
import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { RestoreManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { QUERY_MAX_RECORDS } from 'src/engine/api/graphql/graphql-query-runner/constants/query-max-records.constant';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';

@Injectable()
export class GraphqlQueryRestoreManyResolverService extends GraphqlQueryBaseResolverService<
  RestoreManyResolverArgs,
  ObjectRecord[]
> {
  async resolve(
    executionArgs: GraphqlQueryResolverExecutionArgs<RestoreManyResolverArgs>,
    featureFlagsMap: Record<FeatureFlagKey, boolean>,
  ): Promise<ObjectRecord[]> {
    const { authContext, objectMetadataItemWithFieldMaps, objectMetadataMaps } =
      executionArgs.options;

    const { roleId } = executionArgs;

    const queryBuilder = executionArgs.repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    const tableName = computeTableName(
      objectMetadataItemWithFieldMaps.nameSingular,
      objectMetadataItemWithFieldMaps.isCustom,
    );

    executionArgs.graphqlQueryParser.applyFilterToBuilder(
      queryBuilder,
      tableName,
      executionArgs.args.filter,
    );

    const nonFormattedRestoredObjectRecords = await queryBuilder
      .restore()
      .returning('*')
      .execute();

    const formattedRestoredRecords = formatResult<ObjectRecord[]>(
      nonFormattedRestoredObjectRecords.raw,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
      featureFlagsMap[FeatureFlagKey.IsNewRelationEnabled],
    );

    this.apiEventEmitterService.emitRestoreEvents(
      formattedRestoredRecords,
      authContext,
      objectMetadataItemWithFieldMaps,
    );

    if (executionArgs.graphqlQuerySelectedFieldsResult.relations) {
      await this.processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
        parentObjectRecords: formattedRestoredRecords,
        relations: executionArgs.graphqlQuerySelectedFieldsResult.relations,
        limit: QUERY_MAX_RECORDS,
        authContext,
        dataSource: executionArgs.dataSource,
        isNewRelationEnabled:
          featureFlagsMap[FeatureFlagKey.IsNewRelationEnabled],
        roleId,
        shouldBypassPermissionChecks: executionArgs.isExecutedByApiKey,
      });
    }

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionHelper(
        objectMetadataMaps,
        featureFlagsMap,
      );

    return formattedRestoredRecords.map((record: ObjectRecord) =>
      typeORMObjectRecordsParser.processRecord({
        objectRecord: record,
        objectName: objectMetadataItemWithFieldMaps.nameSingular,
        take: 1,
        totalCount: 1,
      }),
    );
  }

  async validate(
    args: RestoreManyResolverArgs,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<void> {
    assertMutationNotOnRemoteObject(options.objectMetadataItemWithFieldMaps);
    if (!args.filter) {
      throw new Error('Filter is required');
    }

    args.filter.id?.in?.forEach((id: string) => assertIsValidUuid(id));
  }
}
