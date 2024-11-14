import { Injectable } from '@nestjs/common';

import graphqlFields from 'graphql-fields';

import { ResolverService } from 'src/engine/api/graphql/graphql-query-runner/interfaces/resolver-service.interface';
import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { DestroyOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { QUERY_MAX_RECORDS } from 'src/engine/api/graphql/graphql-query-runner/constants/query-max-records.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { ProcessNestedRelationsHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations.helper';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';

@Injectable()
export class GraphqlQueryDestroyOneResolverService
  implements ResolverService<DestroyOneResolverArgs, ObjectRecord>
{
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async resolve<T extends ObjectRecord = ObjectRecord>(
    args: DestroyOneResolverArgs,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<T> {
    const {
      authContext,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
      info,
    } = options;

    const dataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace(
        authContext.workspace.id,
      );

    const repository = dataSource.getRepository(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    const graphqlQueryParser = new GraphqlQueryParser(
      objectMetadataItemWithFieldMaps.fieldsByName,
      objectMetadataMaps,
    );

    const selectedFields = graphqlFields(info);

    const { relations } = graphqlQueryParser.parseSelectedFields(
      objectMetadataItemWithFieldMaps,
      selectedFields,
    );

    const queryBuilder = repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    const nonFormattedDeletedObjectRecords = await queryBuilder
      .where(`"${objectMetadataItemWithFieldMaps.nameSingular}".id = :id`, {
        id: args.id,
      })
      .take(1)
      .delete()
      .returning('*')
      .execute();

    if (!nonFormattedDeletedObjectRecords.affected) {
      throw new GraphqlQueryRunnerException(
        'Record not found',
        GraphqlQueryRunnerExceptionCode.RECORD_NOT_FOUND,
      );
    }

    const recordBeforeDeletion = formatResult(
      nonFormattedDeletedObjectRecords.raw,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    )[0];

    const processNestedRelationsHelper = new ProcessNestedRelationsHelper();

    if (relations) {
      await processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
        parentObjectRecords: [recordBeforeDeletion],
        relations,
        limit: QUERY_MAX_RECORDS,
        authContext,
        dataSource,
      });
    }

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionHelper(objectMetadataMaps);

    return typeORMObjectRecordsParser.processRecord({
      objectRecord: recordBeforeDeletion,
      objectName: objectMetadataItemWithFieldMaps.nameSingular,
      take: 1,
      totalCount: 1,
    });
  }

  async validate(
    args: DestroyOneResolverArgs,
    _options: WorkspaceQueryRunnerOptions,
  ): Promise<void> {
    if (!args.id) {
      throw new GraphqlQueryRunnerException(
        'Missing id',
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }
  }
}
