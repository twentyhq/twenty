import { Injectable } from '@nestjs/common';

import isEmpty from 'lodash.isempty';
import { In } from 'typeorm';

import { ResolverService } from 'src/engine/api/graphql/graphql-query-runner/interfaces/resolver-service.interface';
import {
  Record as IRecord,
  OrderByDirection,
  RecordFilter,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
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
import { ObjectMetadataMapItem } from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { formatData } from 'src/engine/twenty-orm/utils/format-data.util';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';

@Injectable()
export class GraphqlQueryFindDuplicatesResolverService
  implements
    ResolverService<FindDuplicatesResolverArgs, IConnection<IRecord>[]>
{
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async resolve<ObjectRecord extends IRecord = IRecord>(
    args: FindDuplicatesResolverArgs<Partial<ObjectRecord>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<IConnection<ObjectRecord>[]> {
    const { authContext, objectMetadataMapItem, objectMetadataMap } = options;

    const dataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace(
        authContext.workspace.id,
      );
    const repository = dataSource.getRepository(
      objectMetadataMapItem.nameSingular,
    );
    const existingRecordsQueryBuilder = repository.createQueryBuilder(
      objectMetadataMapItem.nameSingular,
    );
    const duplicateRecordsQueryBuilder = repository.createQueryBuilder(
      objectMetadataMapItem.nameSingular,
    );

    const graphqlQueryParser = new GraphqlQueryParser(
      objectMetadataMap[objectMetadataMapItem.nameSingular].fields,
      objectMetadataMap,
    );

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionHelper(objectMetadataMap);

    let objectRecords: Partial<ObjectRecord>[] = [];

    if (args.ids) {
      const nonFormattedObjectRecords = (await existingRecordsQueryBuilder
        .where({ id: In(args.ids) })
        .getMany()) as ObjectRecord[];

      objectRecords = formatResult(
        nonFormattedObjectRecords,
        objectMetadataMapItem,
        objectMetadataMap,
      );
    } else if (args.data && !isEmpty(args.data)) {
      objectRecords = formatData(args.data, objectMetadataMapItem);
    }

    const duplicateConnections: IConnection<ObjectRecord>[] = await Promise.all(
      objectRecords.map(async (record) => {
        const duplicateConditions = this.buildDuplicateConditions(
          objectMetadataMapItem,
          [record],
          record.id,
        );

        if (isEmpty(duplicateConditions)) {
          return typeORMObjectRecordsParser.createConnection({
            objectRecords: [],
            objectName: objectMetadataMapItem.nameSingular,
            take: 0,
            totalCount: 0,
            order: [{ id: OrderByDirection.AscNullsFirst }],
            hasNextPage: false,
            hasPreviousPage: false,
          });
        }

        const withFilterQueryBuilder = graphqlQueryParser.applyFilterToBuilder(
          duplicateRecordsQueryBuilder,
          objectMetadataMapItem.nameSingular,
          duplicateConditions,
        );

        const nonFormattedDuplicates =
          (await withFilterQueryBuilder.getMany()) as ObjectRecord[];

        const duplicates = formatResult(
          nonFormattedDuplicates,
          objectMetadataMapItem,
          objectMetadataMap,
        );

        return typeORMObjectRecordsParser.createConnection({
          objectRecords: duplicates,
          objectName: objectMetadataMapItem.nameSingular,
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
    objectMetadataMapItem: ObjectMetadataMapItem,
    records?: Partial<IRecord>[] | undefined,
    filteringByExistingRecordId?: string,
  ): Partial<RecordFilter> {
    if (!records || records.length === 0) {
      return {};
    }

    const criteriaCollection = this.getApplicableDuplicateCriteriaCollection(
      objectMetadataMapItem,
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

    const filter: Partial<RecordFilter> = {};

    if (conditions && !isEmpty(conditions)) {
      filter.or = conditions;

      if (filteringByExistingRecordId) {
        filter.id = { neq: filteringByExistingRecordId };
      }
    }

    return filter;
  }

  private getApplicableDuplicateCriteriaCollection(
    objectMetadataMapItem: ObjectMetadataMapItem,
  ) {
    return DUPLICATE_CRITERIA_COLLECTION.filter(
      (duplicateCriteria) =>
        duplicateCriteria.objectName === objectMetadataMapItem.nameSingular,
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
