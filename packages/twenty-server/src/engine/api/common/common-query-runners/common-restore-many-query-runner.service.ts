import { Injectable } from '@nestjs/common';

import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FindOptionsRelations, ObjectLiteral } from 'typeorm';

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

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
  RestoreManyQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { buildColumnsToReturn } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-return';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

@Injectable()
export class CommonRestoreManyQueryRunnerService extends CommonBaseQueryRunnerService<
  RestoreManyQueryArgs,
  ObjectRecord[]
> {
  protected readonly operationName = CommonQueryNames.RESTORE_MANY;

  async run(
    args: CommonExtendedInput<RestoreManyQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<ObjectRecord[]> {
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
      args.filter,
    );

    const columnsToReturn = buildColumnsToReturn({
      select: args.selectedFieldsResult.select,
      relations: args.selectedFieldsResult.relations,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    });

    const restoredObjectRecords = await queryBuilder
      .restore()
      .returning(columnsToReturn)
      .execute();

    const restoredRecords =
      restoredObjectRecords.generatedMaps as ObjectRecord[];

    if (isDefined(args.selectedFieldsResult.relations)) {
      await this.processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
        parentObjectRecords: restoredRecords,
        //TODO : Refacto-common - Typing to fix when switching processNestedRelationsHelper to Common
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

    return restoredRecords;
  }

  async computeArgs(
    args: CommonInput<RestoreManyQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<RestoreManyQueryArgs>> {
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
    queryResult: ObjectRecord[],
    objectMetadataItemId: string,
    objectMetadataMaps: ObjectMetadataMaps,
    authContext: WorkspaceAuthContext,
  ): Promise<ObjectRecord[]> {
    return this.commonResultGettersService.processRecordArray(
      queryResult,
      objectMetadataItemId,
      objectMetadataMaps,
      authContext.workspace.id,
    );
  }

  async validate(
    args: RestoreManyQueryArgs,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ) {
    const { objectMetadataItemWithFieldMaps } = queryRunnerContext;

    assertMutationNotOnRemoteObject(objectMetadataItemWithFieldMaps);
    if (!isDefined(args.filter)) {
      throw new CommonQueryRunnerException(
        'Filter is required',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    args.filter.id?.in?.forEach((id: string) => assertIsValidUuid(id));
  }
}
