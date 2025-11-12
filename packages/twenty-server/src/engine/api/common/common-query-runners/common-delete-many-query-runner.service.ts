import { Injectable } from '@nestjs/common';

import { isDefined } from 'class-validator';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { ObjectRecord } from 'twenty-shared/types';
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
  DeleteManyQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { buildColumnsToReturn } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-return';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

@Injectable()
export class CommonDeleteManyQueryRunnerService extends CommonBaseQueryRunnerService<
  DeleteManyQueryArgs,
  ObjectRecord[]
> {
  protected readonly operationName = CommonQueryNames.DELETE_MANY;

  async run(
    args: CommonExtendedInput<DeleteManyQueryArgs>,
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

    const deletedObjectRecords = await queryBuilder
      .softDelete()
      .returning(columnsToReturn)
      .execute();

    const deletedRecords = deletedObjectRecords.generatedMaps as ObjectRecord[];

    if (isDefined(args.selectedFieldsResult.relations)) {
      await this.processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
        parentObjectRecords: deletedRecords,
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

    return deletedRecords;
  }

  async computeArgs(
    args: CommonInput<DeleteManyQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<DeleteManyQueryArgs>> {
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
    args: DeleteManyQueryArgs,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ) {
    const { objectMetadataItemWithFieldMaps } = queryRunnerContext;

    assertMutationNotOnRemoteObject(objectMetadataItemWithFieldMaps);
    if (!args.filter) {
      throw new CommonQueryRunnerException(
        'Filter is required',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    args.filter.id?.in?.forEach((id: string) => assertIsValidUuid(id));
  }
}
