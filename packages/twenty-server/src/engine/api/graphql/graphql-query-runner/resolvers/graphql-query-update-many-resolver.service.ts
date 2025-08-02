import { Injectable } from '@nestjs/common';

import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';

import {
  GraphqlQueryBaseResolverService,
  GraphqlQueryResolverExecutionArgs,
} from 'src/engine/api/graphql/graphql-query-runner/interfaces/base-resolver-service';
import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { UpdateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { buildColumnsToReturn } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-return';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';

@Injectable()
export class GraphqlQueryUpdateManyResolverService extends GraphqlQueryBaseResolverService<
  UpdateManyResolverArgs,
  ObjectRecord[]
> {
  async resolve(
    executionArgs: GraphqlQueryResolverExecutionArgs<UpdateManyResolverArgs>,
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

    const columnsToReturn = buildColumnsToReturn({
      select: executionArgs.graphqlQuerySelectedFieldsResult.select,
      relations: executionArgs.graphqlQuerySelectedFieldsResult.relations,
      objectMetadataItemWithFieldMaps,
    });

    const updatedObjectRecords = await queryBuilder
      .update()
      .set(executionArgs.args.data)
      .returning(columnsToReturn)
      .execute();

    if (executionArgs.graphqlQuerySelectedFieldsResult.relations) {
      await this.processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
        parentObjectRecords:
          updatedObjectRecords.generatedMaps as ObjectRecord[],
        relations: executionArgs.graphqlQuerySelectedFieldsResult.relations,
        limit: QUERY_MAX_RECORDS,
        authContext,
        workspaceDataSource: executionArgs.workspaceDataSource,
        roleId,
        shouldBypassPermissionChecks:
          executionArgs.shouldBypassPermissionChecks,
        selectedFields: executionArgs.graphqlQuerySelectedFieldsResult.select,
      });
    }

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionHelper(objectMetadataMaps);

    return updatedObjectRecords.generatedMaps.map((record: ObjectRecord) =>
      typeORMObjectRecordsParser.processRecord({
        objectRecord: record,
        objectName: objectMetadataItemWithFieldMaps.nameSingular,
        take: 1,
        totalCount: 1,
      }),
    );
  }

  async validate(
    args: UpdateManyResolverArgs<Partial<ObjectRecord>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<void> {
    assertMutationNotOnRemoteObject(options.objectMetadataItemWithFieldMaps);
    if (!args.filter) {
      throw new Error('Filter is required');
    }

    args.filter.id?.in?.forEach((id: string) => assertIsValidUuid(id));
  }
}
