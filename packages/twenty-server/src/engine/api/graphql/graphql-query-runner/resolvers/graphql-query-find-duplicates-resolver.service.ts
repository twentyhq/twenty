import { Injectable } from '@nestjs/common';

import isEmpty from 'lodash.isempty';
import { In } from 'typeorm';

import {
  GraphqlQueryBaseResolverService,
  GraphqlQueryResolverExecutionArgs,
} from 'src/engine/api/graphql/graphql-query-runner/interfaces/base-resolver-service';
import {
  ObjectRecord,
  OrderByDirection,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { FindDuplicatesResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import { buildDuplicateConditions } from 'src/engine/api/utils/build-duplicate-conditions.utils';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';

@Injectable()
export class GraphqlQueryFindDuplicatesResolverService extends GraphqlQueryBaseResolverService<
  FindDuplicatesResolverArgs,
  IConnection<ObjectRecord>[]
> {
  async resolve(
    executionArgs: GraphqlQueryResolverExecutionArgs<FindDuplicatesResolverArgs>,
  ): Promise<IConnection<ObjectRecord>[]> {
    const { objectMetadataItemWithFieldMaps, objectMetadataMaps } =
      executionArgs.options;

    const existingRecordsQueryBuilder =
      executionArgs.repository.createQueryBuilder(
        objectMetadataItemWithFieldMaps.nameSingular,
      );

    const objectMetadataItemWithFieldsMaps =
      getObjectMetadataMapItemByNameSingular(
        objectMetadataMaps,
        objectMetadataItemWithFieldMaps.nameSingular,
      );

    if (!objectMetadataItemWithFieldsMaps) {
      throw new GraphqlQueryRunnerException(
        `Object ${objectMetadataItemWithFieldMaps.nameSingular} not found`,
        GraphqlQueryRunnerExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    const graphqlQueryParser = new GraphqlQueryParser(
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    );

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionHelper(objectMetadataMaps);

    let objectRecords: Partial<ObjectRecord>[] = [];

    const columnsToSelect = buildColumnsToSelect({
      select: executionArgs.graphqlQuerySelectedFieldsResult.select,
      relations: executionArgs.graphqlQuerySelectedFieldsResult.relations,
      objectMetadataItemWithFieldMaps,
    });

    if (executionArgs.args.ids) {
      objectRecords = (await existingRecordsQueryBuilder
        .where({ id: In(executionArgs.args.ids) })
        .setFindOptions({
          select: columnsToSelect,
        })
        .getMany()) as ObjectRecord[];
    } else if (executionArgs.args.data && !isEmpty(executionArgs.args.data)) {
      objectRecords = executionArgs.args.data;
    }

    const duplicateConnections: IConnection<ObjectRecord>[] = await Promise.all(
      objectRecords.map(async (record) => {
        const duplicateConditions = buildDuplicateConditions(
          objectMetadataItemWithFieldMaps,
          [record],
          record.id,
        );

        if (isEmpty(duplicateConditions)) {
          return typeORMObjectRecordsParser.createConnection({
            objectRecords: [],
            objectName: objectMetadataItemWithFieldMaps.nameSingular,
            take: 0,
            totalCount: 0,
            order: [{ id: OrderByDirection.AscNullsFirst }],
            hasNextPage: false,
            hasPreviousPage: false,
          });
        }

        const duplicateRecordsQueryBuilder =
          executionArgs.repository.createQueryBuilder(
            objectMetadataItemWithFieldMaps.nameSingular,
          );

        graphqlQueryParser.applyFilterToBuilder(
          duplicateRecordsQueryBuilder,
          objectMetadataItemWithFieldMaps.nameSingular,
          duplicateConditions,
        );

        const duplicates = (await duplicateRecordsQueryBuilder
          .setFindOptions({
            select: columnsToSelect,
          })
          .getMany()) as ObjectRecord[];

        return typeORMObjectRecordsParser.createConnection({
          objectRecords: duplicates,
          objectName: objectMetadataItemWithFieldMaps.nameSingular,
          take: duplicates.length,
          totalCount: duplicates.length,
          order: [{ id: OrderByDirection.AscNullsFirst }],
          hasNextPage: false,
          hasPreviousPage: false,
        });
      }),
    );

    return duplicateConnections;
  }

  async validate(
    args: FindDuplicatesResolverArgs,
    _options: WorkspaceQueryRunnerOptions,
  ): Promise<void> {
    if (!args.data && !args.ids) {
      throw new GraphqlQueryRunnerException(
        'You have to provide either "data" or "ids" argument',
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    if (args.data && args.ids) {
      throw new GraphqlQueryRunnerException(
        'You cannot provide both "data" and "ids" arguments',
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    if (!args.ids && isEmpty(args.data)) {
      throw new GraphqlQueryRunnerException(
        'The "data" condition can not be empty when "ids" input not provided',
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }
  }
}
