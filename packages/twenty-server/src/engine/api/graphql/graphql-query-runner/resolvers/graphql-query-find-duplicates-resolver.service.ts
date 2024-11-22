import { Injectable } from '@nestjs/common';

import isEmpty from 'lodash.isempty';
import { In } from 'typeorm';

import {
  GraphqlQueryBaseResolverService,
  GraphqlQueryResolverExecutionArgs,
} from 'src/engine/api/graphql/graphql-query-runner/interfaces/base-resolver-service';
import {
  ObjectRecord,
  ObjectRecordFilter,
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
import { settings } from 'src/engine/constants/settings';
import { DUPLICATE_CRITERIA_COLLECTION } from 'src/engine/core-modules/duplicate/constants/duplicate-criteria.constants';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { formatData } from 'src/engine/twenty-orm/utils/format-data.util';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';

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
      objectMetadataItemWithFieldsMaps?.fieldsByName,
      objectMetadataMaps,
    );

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionHelper(objectMetadataMaps);

    let objectRecords: Partial<ObjectRecord>[] = [];

    if (executionArgs.args.ids) {
      const nonFormattedObjectRecords = (await existingRecordsQueryBuilder
        .where({ id: In(executionArgs.args.ids) })
        .getMany()) as ObjectRecord[];

      objectRecords = formatResult(
        nonFormattedObjectRecords,
        objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
      );
    } else if (executionArgs.args.data && !isEmpty(executionArgs.args.data)) {
      objectRecords = formatData(
        executionArgs.args.data,
        objectMetadataItemWithFieldMaps,
      );
    }

    const duplicateConnections: IConnection<ObjectRecord>[] = await Promise.all(
      objectRecords.map(async (record) => {
        const duplicateConditions = this.buildDuplicateConditions(
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

        const nonFormattedDuplicates =
          (await duplicateRecordsQueryBuilder.getMany()) as ObjectRecord[];

        const duplicates = formatResult<ObjectRecord[]>(
          nonFormattedDuplicates,
          objectMetadataItemWithFieldMaps,
          objectMetadataMaps,
        );

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

  private buildDuplicateConditions(
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
    records?: Partial<ObjectRecord>[] | undefined,
    filteringByExistingRecordId?: string,
  ): Partial<ObjectRecordFilter> {
    if (!records || records.length === 0) {
      return {};
    }

    const criteriaCollection = this.getApplicableDuplicateCriteriaCollection(
      objectMetadataItemWithFieldMaps,
    );

    const conditions = records.flatMap((record) => {
      const criteriaWithMatchingArgs = criteriaCollection.filter((criteria) =>
        criteria.columnNames.every((columnName) => {
          const value = record[columnName] as string | undefined;

          return (
            value && value.length >= settings.minLengthOfStringForDuplicateCheck
          );
        }),
      );

      return criteriaWithMatchingArgs.map((criteria) => {
        const condition = {};

        criteria.columnNames.forEach((columnName) => {
          condition[columnName] = { eq: record[columnName] };
        });

        return condition;
      });
    });

    const filter: Partial<ObjectRecordFilter> = {};

    if (conditions && !isEmpty(conditions)) {
      filter.or = conditions;

      if (filteringByExistingRecordId) {
        filter.id = { neq: filteringByExistingRecordId };
      }
    }

    return filter;
  }

  private getApplicableDuplicateCriteriaCollection(
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
  ) {
    return DUPLICATE_CRITERIA_COLLECTION.filter(
      (duplicateCriteria) =>
        duplicateCriteria.objectName ===
        objectMetadataItemWithFieldMaps.nameSingular,
    );
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
