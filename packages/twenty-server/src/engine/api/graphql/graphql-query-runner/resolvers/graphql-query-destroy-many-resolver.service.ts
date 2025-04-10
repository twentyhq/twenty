import { Injectable } from '@nestjs/common';

import {
  GraphqlQueryBaseResolverService,
  GraphqlQueryResolverExecutionArgs,
} from 'src/engine/api/graphql/graphql-query-runner/interfaces/base-resolver-service';
import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { DestroyManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { QUERY_MAX_RECORDS } from 'src/engine/api/graphql/graphql-query-runner/constants/query-max-records.constant';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';

@Injectable()
export class GraphqlQueryDestroyManyResolverService extends GraphqlQueryBaseResolverService<
  DestroyManyResolverArgs,
  ObjectRecord[]
> {
  async resolve(
    executionArgs: GraphqlQueryResolverExecutionArgs<DestroyManyResolverArgs>,
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

    const nonFormattedDeletedObjectRecords = await queryBuilder
      .delete()
      .returning('*')
      .execute();

    const deletedRecords = formatResult<ObjectRecord[]>(
      nonFormattedDeletedObjectRecords.raw,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    );

    this.apiEventEmitterService.emitDestroyEvents(
      deletedRecords,
      authContext,
      objectMetadataItemWithFieldMaps,
    );

    if (executionArgs.graphqlQuerySelectedFieldsResult.relations) {
      await this.processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
        parentObjectRecords: deletedRecords,
        relations: executionArgs.graphqlQuerySelectedFieldsResult.relations,
        limit: QUERY_MAX_RECORDS,
        authContext,
        dataSource: executionArgs.dataSource,
        isNewRelationEnabled:
          featureFlagsMap[FeatureFlagKey.IsNewRelationEnabled],
        roleId,
      });
    }

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionHelper(
        objectMetadataMaps,
        featureFlagsMap,
      );

    return deletedRecords.map((record: ObjectRecord) =>
      typeORMObjectRecordsParser.processRecord({
        objectRecord: record,
        objectName: objectMetadataItemWithFieldMaps.nameSingular,
        take: 1,
        totalCount: 1,
      }),
    );
  }

  async validate(
    args: DestroyManyResolverArgs,
    _options: WorkspaceQueryRunnerOptions,
  ): Promise<void> {
    if (!args.filter) {
      throw new Error('Filter is required');
    }
  }
}
