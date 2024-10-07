import { Injectable } from '@nestjs/common';

import graphqlFields from 'graphql-fields';
import { In, InsertResult } from 'typeorm';

import { ResolverService } from 'src/engine/api/graphql/graphql-query-runner/interfaces/resolver-service.interface';
import { Record as IRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { QUERY_MAX_RECORDS } from 'src/engine/api/graphql/graphql-query-runner/constants/query-max-records.constant';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { ProcessNestedRelationsHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations.helper';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';

@Injectable()
export class GraphqlQueryCreateManyResolverService
  implements ResolverService<CreateManyResolverArgs, IRecord[]>
{
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async resolve<ObjectRecord extends IRecord = IRecord>(
    args: CreateManyResolverArgs<Partial<ObjectRecord>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<ObjectRecord[]> {
    const { authContext, info, objectMetadataMap, objectMetadataMapItem } =
      options;
    const dataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace(
        authContext.workspace.id,
      );
    const repository = dataSource.getRepository(
      objectMetadataMapItem.nameSingular,
    );

    const graphqlQueryParser = new GraphqlQueryParser(
      objectMetadataMapItem.fields,
      objectMetadataMap,
    );

    const selectedFields = graphqlFields(info);

    const { relations } = graphqlQueryParser.parseSelectedFields(
      objectMetadataMapItem,
      selectedFields,
    );

    const objectRecords: InsertResult = !args.upsert
      ? await repository.insert(args.data)
      : await repository.upsert(args.data, {
          conflictPaths: ['id'],
          skipUpdateIfNoValuesChanged: true,
        });

    const queryBuilder = repository.createQueryBuilder(
      objectMetadataMapItem.nameSingular,
    );

    const nonFormattedUpsertedRecords = (await queryBuilder
      .where({
        id: In(objectRecords.generatedMaps.map((record) => record.id)),
      })
      .take(QUERY_MAX_RECORDS)
      .getMany()) as ObjectRecord[];

    const upsertedRecords = formatResult(
      nonFormattedUpsertedRecords,
      objectMetadataMapItem,
      objectMetadataMap,
    );

    const processNestedRelationsHelper = new ProcessNestedRelationsHelper();

    if (relations) {
      await processNestedRelationsHelper.processNestedRelations(
        objectMetadataMap,
        objectMetadataMapItem,
        upsertedRecords,
        relations,
        QUERY_MAX_RECORDS,
        authContext,
        dataSource,
      );
    }

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionHelper(objectMetadataMap);

    return upsertedRecords.map((record: ObjectRecord) =>
      typeORMObjectRecordsParser.processRecord(
        record,
        objectMetadataMapItem.nameSingular,
        1,
        1,
      ),
    );
  }

  async validate<ObjectRecord extends IRecord>(
    args: CreateManyResolverArgs<Partial<ObjectRecord>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<void> {
    assertMutationNotOnRemoteObject(options.objectMetadataItem);

    /*
    const uniqueIndexes = options.objectMetadataItem.indexes.filter(
      (index) => index.isUnique,
    );

    uniqueIndexes.forEach((index) => {
      const recordMap = new Map<string, Set<string>>();

      args.data.forEach((record, index) => {
        index.fields.forEach((fieldName) => {
          const value = record[fieldName];
        });
      });
    });

    if (uniqueIndexes.length > 0) {
      const recordMap = new Map<string, Set<string>>();

      args.data.forEach((record, index) => {
        uniqueIndexes.forEach((fieldName) => {
          const value = record[fieldName];

          if (value !== undefined && value !== null) {
            const key = `${fieldName}:${value}`;

            if (!recordMap.has(key)) {
              recordMap.set(key, new Set());
            }
            recordMap.get(key)?.add(index.toString());
          }
        });
      });

      const violations = Array.from(recordMap.entries())
        .filter(([, indexes]) => indexes.size > 1)
        .map(([key, indexes]) => {
          const [fieldName, value] = key.split(':');

          return {
            field: fieldName,
            value: value,
            indexes: Array.from(indexes).map(Number),
          };
        });

      if (violations.length > 0) {
        throw new Error(
          `Unique constraint violation(s) detected: ${JSON.stringify(
            violations,
          )}`,
        );
      }
    }
    */
    args.data.forEach((record) => {
      if (record?.id) {
        assertIsValidUuid(record.id);
      }
    });
  }
}
