import { Injectable } from '@nestjs/common';

import { QUERY_MAX_RECORDS_FROM_RELATION } from 'twenty-shared/constants';
import { ObjectRecord } from 'twenty-shared/types';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import {
  CommonExtendedInput,
  CommonInput,
  CommonQueryNames,
  UpdateManyQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { buildColumnsToReturn } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-return';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { type CommonQueryResultProcessingArgs } from 'src/engine/api/common/types/common-query-result-processing-args.type';

@Injectable()
export class CommonUpdateManyQueryRunnerService extends CommonBaseQueryRunnerService<
  UpdateManyQueryArgs,
  ObjectRecord[]
> {
  protected readonly operationName = CommonQueryNames.UPDATE_MANY;

  async run(
    args: CommonExtendedInput<UpdateManyQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<ObjectRecord[]> {
    const {
      authContext,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatObjectMetadata,
    } = queryRunnerContext;

    const columnsToReturn = buildColumnsToReturn({
      selection: args.selectedFieldsResult,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    const updatedRecords = await this.runFilteredMutation({
      queryRunnerContext,
      filter: args.filter,
      columnsToReturn,
      kind: 'update',
      data: args.data,
    });

    await this.processNestedRelationsHelper.processNestedRelations({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      parentObjectMetadataItem: flatObjectMetadata,
      parentObjectRecords: updatedRecords,
      selection: args.selectedFieldsResult,
      limit: QUERY_MAX_RECORDS_FROM_RELATION,
      authContext,
      ...this.getNestedRelationsReadPathOptions(),
    });

    return updatedRecords;
  }

  async computeArgs(
    args: CommonInput<UpdateManyQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<UpdateManyQueryArgs>> {
    const {
      authContext,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    } = queryRunnerContext;

    return {
      ...args,
      filter: this.filterArgProcessor.process({
        filter: args.filter,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
      data: (
        await this.dataArgProcessor.process({
          partialRecordInputs: [args.data],
          authContext,
          flatObjectMetadata,
          flatFieldMetadataMaps,
          flatObjectMetadataMaps,
          shouldBackfillPositionIfUndefined: false,
        })
      )[0],
    };
  }

  async validate(
    args: CommonInput<UpdateManyQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<void> {
    const { flatObjectMetadata } = queryRunnerContext;

    assertMutationNotOnRemoteObject(flatObjectMetadata);
    if (!args.filter) {
      throw new CommonQueryRunnerException(
        'Filter is required',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    args.filter.id?.in?.forEach((id: string) => assertIsValidUuid(id));
  }

  async processQueryResult({
    queryResult,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    authContext,
    selection,
  }: CommonQueryResultProcessingArgs<ObjectRecord[]>): Promise<ObjectRecord[]> {
    return await this.commonResultGettersService.processRecordArray({
      records: queryResult,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      workspaceId: authContext.workspace.id,
      selection,
    });
  }
}
