import graphqlFields from 'graphql-fields';

import {
  Record as IRecord,
  RecordFilter,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { FindOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { QUERY_MAX_RECORDS } from 'src/engine/api/graphql/graphql-query-runner/constants/query-max-records.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ProcessNestedRelationsHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations.helper';
import { ObjectRecordsToGraphqlConnectionMapper } from 'src/engine/api/graphql/graphql-query-runner/orm-mappers/object-records-to-graphql-connection.mapper';
import { getObjectMetadataOrThrow } from 'src/engine/api/graphql/graphql-query-runner/utils/get-object-metadata-or-throw.util';
import { generateObjectMetadataMap } from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';

export class GraphqlQueryFindOneResolverService {
  private twentyORMGlobalManager: TwentyORMGlobalManager;

  constructor(twentyORMGlobalManager: TwentyORMGlobalManager) {
    this.twentyORMGlobalManager = twentyORMGlobalManager;
  }

  async findOne<
    ObjectRecord extends IRecord = IRecord,
    Filter extends RecordFilter = RecordFilter,
  >(
    args: FindOneResolverArgs<Filter>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<ObjectRecord | undefined> {
    const { authContext, objectMetadataItem, info, objectMetadataCollection } =
      options;

    const dataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace(
        authContext.workspace.id,
      );

    const repository = dataSource.getRepository(
      objectMetadataItem.nameSingular,
    );

    const queryBuilder = repository.createQueryBuilder(
      objectMetadataItem.nameSingular,
    );

    const objectMetadataMap = generateObjectMetadataMap(
      objectMetadataCollection,
    );

    const objectMetadata = getObjectMetadataOrThrow(
      objectMetadataMap,
      objectMetadataItem.nameSingular,
    );

    const graphqlQueryParser = new GraphqlQueryParser(
      objectMetadata.fields,
      objectMetadataMap,
    );

    const selectedFields = graphqlFields(info);

    const { relations } = graphqlQueryParser.parseSelectedFields(
      objectMetadataItem,
      selectedFields,
    );

    const withFilterQueryBuilder = graphqlQueryParser.applyFilterToBuilder(
      queryBuilder,
      objectMetadataItem.nameSingular,
      args.filter ?? ({} as Filter),
    );

    const withDeletedQueryBuilder = graphqlQueryParser.applyDeletedAtToBuilder(
      withFilterQueryBuilder,
      args.filter ?? ({} as Filter),
    );

    const nonFormattedObjectRecord = await withDeletedQueryBuilder.getOne();

    const objectRecord = formatResult(
      nonFormattedObjectRecord,
      objectMetadata,
      objectMetadataMap,
    );

    const limit = QUERY_MAX_RECORDS;

    if (!objectRecord) {
      throw new GraphqlQueryRunnerException(
        'Record not found',
        GraphqlQueryRunnerExceptionCode.RECORD_NOT_FOUND,
      );
    }

    const processNestedRelationsHelper = new ProcessNestedRelationsHelper(
      this.twentyORMGlobalManager,
    );

    const objectRecords = [objectRecord];

    if (relations) {
      await processNestedRelationsHelper.processNestedRelations(
        objectMetadataMap,
        objectMetadata,
        objectRecords,
        relations,
        limit,
        authContext,
        dataSource,
      );
    }

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionMapper(objectMetadataMap);

    return typeORMObjectRecordsParser.processRecord(
      objectRecords[0],
      objectMetadataItem.nameSingular,
      1,
      1,
    ) as ObjectRecord;
  }
}
