import { Injectable } from '@nestjs/common';

import graphqlFields from 'graphql-fields';

import { ResolverService } from 'src/engine/api/graphql/graphql-query-runner/interfaces/resolver-service.interface';
import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { QUERY_MAX_RECORDS } from 'src/engine/api/graphql/graphql-query-runner/constants/query-max-records.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { ProcessNestedRelationsHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations.helper';
import { ApiEventEmitterService } from 'src/engine/api/graphql/graphql-query-runner/services/api-event-emitter.service';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { formatData } from 'src/engine/twenty-orm/utils/format-data.util';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';

@Injectable()
export class GraphqlQueryUpdateOneResolverService
  implements ResolverService<UpdateOneResolverArgs, ObjectRecord>
{
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly apiEventEmitterService: ApiEventEmitterService,
  ) {}

  async resolve<T extends ObjectRecord = ObjectRecord>(
    args: UpdateOneResolverArgs<Partial<T>>,
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

    const data = formatData(args.data, objectMetadataItemWithFieldMaps);

    const existingRecordBuilder = queryBuilder.clone();

    const existingRecords = await existingRecordBuilder
      .where({ id: args.id })
      .execute();

    const formattedExistingRecords = formatResult(
      existingRecords,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    );

    const result = await queryBuilder
      .update(data)
      .where({ id: args.id })
      .returning('*')
      .execute();

    const nonFormattedUpdatedObjectRecords = result.raw;

    const formattedUpdatedRecords = formatResult(
      nonFormattedUpdatedObjectRecords,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    );

    this.apiEventEmitterService.emitUpdateEvents(
      formattedExistingRecords,
      formattedUpdatedRecords,
      Object.keys(args.data),
      options.authContext,
      options.objectMetadataItemWithFieldMaps,
    );

    if (formattedUpdatedRecords.length === 0) {
      throw new GraphqlQueryRunnerException(
        'Record not found',
        GraphqlQueryRunnerExceptionCode.RECORD_NOT_FOUND,
      );
    }

    const updatedRecord = formattedUpdatedRecords[0] as T;

    const processNestedRelationsHelper = new ProcessNestedRelationsHelper();

    if (relations) {
      await processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
        parentObjectRecords: [updatedRecord],
        relations,
        limit: QUERY_MAX_RECORDS,
        authContext,
        dataSource,
      });
    }

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionHelper(objectMetadataMaps);

    return typeORMObjectRecordsParser.processRecord<T>({
      objectRecord: updatedRecord,
      objectName: objectMetadataItemWithFieldMaps.nameSingular,
      take: 1,
      totalCount: 1,
    });
  }

  async validate<T extends ObjectRecord = ObjectRecord>(
    args: UpdateOneResolverArgs<Partial<T>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<void> {
    assertMutationNotOnRemoteObject(options.objectMetadataItemWithFieldMaps);
    assertIsValidUuid(args.id);
  }
}
