import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import {
  QUERY_MAX_RECORDS,
  QUERY_MAX_RECORDS_FROM_RELATION,
} from 'twenty-shared/constants';
import { ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FindOptionsRelations, In, ObjectLiteral } from 'typeorm';

import { WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import {
  CommonExtendedInput,
  CommonInput,
  CommonQueryNames,
  DestroyManyQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { buildMutationQueryBuilder } from 'src/engine/api/common/common-query-runners/utils/build-mutation-query-builder.util';
import { isRecordFilterEmpty } from 'src/engine/api/common/common-query-runners/utils/is-record-filter-empty.util';
import { buildColumnsToReturn } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-return';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';

@Injectable()
export class CommonDestroyManyQueryRunnerService extends CommonBaseQueryRunnerService<
  DestroyManyQueryArgs,
  ObjectRecord[]
> {
  protected readonly operationName = CommonQueryNames.DESTROY_MANY;

  async run(
    args: CommonExtendedInput<DestroyManyQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<ObjectRecord[]> {
    const {
      authContext,
      rolePermissionConfig,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatObjectMetadata,
    } = queryRunnerContext;

    const columnsToReturn = buildColumnsToReturn({
      select: args.selectedFieldsResult.select,
      relations: args.selectedFieldsResult.relations,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    const destroyedRecords = await this.destroyWithinRecordLimitOrThrow({
      queryRunnerContext,
      filter: args.filter,
      columnsToReturn,
    });

    if (isDefined(args.selectedFieldsResult.relations)) {
      await this.processNestedRelationsHelper.processNestedRelations({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        parentObjectMetadataItem: flatObjectMetadata,
        parentObjectRecords: destroyedRecords,
        relations: args.selectedFieldsResult.relations as Record<
          string,
          FindOptionsRelations<ObjectLiteral>
        >,
        limit: QUERY_MAX_RECORDS_FROM_RELATION,
        authContext,
        rolePermissionConfig,
        selectedFields: args.selectedFieldsResult.select,
        ...this.getNestedRelationsReadPathOptions(),
      });
    }

    return destroyedRecords;
  }

  // The records are counted with the destroy's own filter and row-level
  // predicates, then only the records counted can be destroyed
  private async destroyWithinRecordLimitOrThrow({
    queryRunnerContext,
    filter,
    columnsToReturn,
  }: {
    queryRunnerContext: CommonExtendedQueryRunnerContext;
    filter: DestroyManyQueryArgs['filter'];
    columnsToReturn: string[];
  }): Promise<ObjectRecord[]> {
    if (isRecordFilterEmpty(filter)) {
      throw new CommonQueryRunnerException(
        'A non-empty filter is required for a bulk mutation',
        CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    const writeRepository = this.getWriteRepository(queryRunnerContext);

    const { selectQueryBuilder, rowLevelPermissionsApplied } =
      buildMutationQueryBuilder({
        repository: writeRepository,
        alias: queryRunnerContext.flatObjectMetadata.nameSingular,
        filter,
        commonQueryParser: queryRunnerContext.commonQueryParser,
        kind: 'delete',
      });

    const targetedRecordIds = await writeRepository.findDeleteTargetIds({
      selectQueryBuilder,
      rowLevelPermissionsApplied,
      limit: QUERY_MAX_RECORDS + 1,
    });

    if (targetedRecordIds.length > QUERY_MAX_RECORDS) {
      throw buildTooManyRecordsToDestroyException();
    }

    selectQueryBuilder.andWhere({ id: In(targetedRecordIds) });

    return writeRepository.runMutation({
      selectQueryBuilder,
      rowLevelPermissionsApplied,
      kind: 'delete',
      columnsToReturn,
    });
  }

  async computeArgs(
    args: CommonInput<DestroyManyQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<DestroyManyQueryArgs>> {
    const {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = queryRunnerContext;

    return {
      ...args,
      filter: this.filterArgProcessor.process({
        filter: args.filter,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    };
  }

  async processQueryResult(
    queryResult: ObjectRecord[],
    flatObjectMetadata: FlatObjectMetadata,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>,
    authContext: WorkspaceAuthContext,
  ): Promise<ObjectRecord[]> {
    return this.commonResultGettersService.processRecordArray(
      queryResult,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      authContext.workspace.id,
    );
  }

  async validate(
    args: CommonInput<DestroyManyQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<void> {
    const { flatObjectMetadata } = queryRunnerContext;

    assertMutationNotOnRemoteObject(flatObjectMetadata);

    if (!isDefined(args.filter)) {
      throw new CommonQueryRunnerException(
        'Filter is required',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    args.filter.id?.in?.forEach((id: string) => assertIsValidUuid(id));

    // Checked before the pre-query hooks, which act on these ids first
    if ((args.filter.id?.in?.length ?? 0) > QUERY_MAX_RECORDS) {
      throw buildTooManyRecordsToDestroyException();
    }
  }
}

const buildTooManyRecordsToDestroyException = () =>
  new CommonQueryRunnerException(
    `Cannot destroy more than ${QUERY_MAX_RECORDS} records at once`,
    CommonQueryRunnerExceptionCode.TOO_MANY_RECORDS_TO_DESTROY,
    {
      userFriendlyMessage: msg`You can only permanently delete up to ${QUERY_MAX_RECORDS} records at once.`,
    },
  );
