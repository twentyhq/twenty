import { Injectable } from '@nestjs/common';

import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { FindOptionsRelations, ObjectLiteral } from 'typeorm';

import {
  ObjectRecord,
  ObjectRecordFilter,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { FindOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { FindOneQueryArgs } from 'src/engine/api/common/types/common-query-args.type';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import {
  WorkspaceQueryRunnerException,
  WorkspaceQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.exception';

@Injectable()
export class CommonFindOneQueryRunnerService extends CommonBaseQueryRunnerService<
  FindOneQueryArgs,
  ObjectRecord
> {
  async run(
    executionContext: CommonBaseQueryRunnerContext<FindOneQueryArgs>,
  ): Promise<ObjectRecord> {
    const { authContext, objectMetadataItemWithFieldMaps, objectMetadataMaps } =
      executionContext.options;

    const { roleId } = executionContext;

    const queryBuilder = executionContext.repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    //TODO : Refacto-common - QueryParser should be common branded service
    const commonQueryParser = new GraphqlQueryParser(
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    );

    commonQueryParser.applyFilterToBuilder(
      queryBuilder,
      objectMetadataItemWithFieldMaps.nameSingular,
      executionContext.args.filter ?? ({} as ObjectRecordFilter),
    );

    commonQueryParser.applyDeletedAtToBuilder(
      queryBuilder,
      executionContext.args.filter ?? ({} as ObjectRecordFilter),
    );

    const columnsToSelect = buildColumnsToSelect({
      select: executionContext.selectedFieldsResult.select,
      relations: executionContext.selectedFieldsResult.relations,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    });

    const objectRecord = await queryBuilder
      .setFindOptions({
        select: columnsToSelect,
      })
      .getOne();

    if (!objectRecord) {
      throw new CommonQueryRunnerException(
        'Record not found',
        CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
      );
    }

    const objectRecords = [objectRecord] as ObjectRecord[];

    if (executionContext.selectedFieldsResult.relations) {
      await this.processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
        parentObjectRecords: objectRecords,
        //TODO : Refacto-common - To fix when switching processNestedRelationsHelper to Common
        relations: executionContext.selectedFieldsResult.relations as Record<
          string,
          FindOptionsRelations<ObjectLiteral>
        >,
        limit: QUERY_MAX_RECORDS,
        authContext,
        workspaceDataSource: executionContext.workspaceDataSource,
        roleId,
        shouldBypassPermissionChecks:
          executionContext.shouldBypassPermissionChecks,
        selectedFields: executionContext.selectedFieldsResult.select,
      });
    }

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionHelper(objectMetadataMaps);

    return typeORMObjectRecordsParser.processRecord({
      objectRecord: objectRecords[0],
      objectName: objectMetadataItemWithFieldMaps.nameSingular,
      take: 1,
      totalCount: 1,
    }) as ObjectRecord;
  }

  async validate(
    args: FindOneResolverArgs<ObjectRecordFilter>,
    _options: WorkspaceQueryRunnerOptions,
  ): Promise<void> {
    if (!args.filter || Object.keys(args.filter).length === 0) {
      throw new WorkspaceQueryRunnerException(
        'Missing filter argument',
        WorkspaceQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }
  }
}
