import { Injectable } from '@nestjs/common';

import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FindOptionsRelations, ObjectLiteral } from 'typeorm';

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';
import { ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import {
  CommonExtendedInput,
  CommonInput,
  CommonQueryNames,
  FindOneQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

@Injectable()
export class CommonFindOneQueryRunnerService extends CommonBaseQueryRunnerService<
  FindOneQueryArgs,
  ObjectRecord
> {
  protected readonly operationName = CommonQueryNames.FIND_ONE;

  async run(
    args: CommonExtendedInput<FindOneQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<ObjectRecord> {
    const {
      repository,
      authContext,
      rolePermissionConfig,
      workspaceDataSource,
      objectMetadataMaps,
      objectMetadataItemWithFieldMaps,
      commonQueryParser,
    } = queryRunnerContext;

    const queryBuilder = repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    commonQueryParser.applyFilterToBuilder(
      queryBuilder,
      objectMetadataItemWithFieldMaps.nameSingular,
      args.filter ?? ({} as ObjectRecordFilter),
    );

    commonQueryParser.applyDeletedAtToBuilder(
      queryBuilder,
      args.filter ?? ({} as ObjectRecordFilter),
    );

    const columnsToSelect = buildColumnsToSelect({
      select: args.selectedFieldsResult.select,
      relations: args.selectedFieldsResult.relations,
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

    if (isDefined(args.selectedFieldsResult.relations)) {
      await this.processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
        parentObjectRecords: objectRecords,
        //TODO : Refacto-common - To fix when switching processNestedRelationsHelper to Common
        relations: args.selectedFieldsResult.relations as Record<
          string,
          FindOptionsRelations<ObjectLiteral>
        >,
        limit: QUERY_MAX_RECORDS,
        authContext,
        workspaceDataSource,
        rolePermissionConfig,
        selectedFields: args.selectedFieldsResult.select,
      });
    }

    return objectRecords[0];
  }

  async computeArgs(
    args: CommonInput<FindOneQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<FindOneQueryArgs>> {
    const { objectMetadataItemWithFieldMaps } = queryRunnerContext;

    return {
      ...args,
      filter: this.queryRunnerArgsFactory.overrideFilterByFieldMetadata(
        args.filter,
        objectMetadataItemWithFieldMaps,
      ),
    };
  }

  async processQueryResult(
    queryResult: ObjectRecord,
    objectMetadataItemId: string,
    objectMetadataMaps: ObjectMetadataMaps,
    authContext: WorkspaceAuthContext,
  ): Promise<ObjectRecord> {
    return this.commonResultGettersService.processRecord(
      queryResult,
      objectMetadataItemId,
      objectMetadataMaps,
      authContext.workspace.id,
    );
  }

  async validate(
    args: CommonInput<FindOneQueryArgs>,
    _queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<void> {
    if (!args.filter || Object.keys(args.filter).length === 0) {
      throw new CommonQueryRunnerException(
        'Missing filter argument',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }
  }
}
