import { Injectable } from '@nestjs/common';

import { ObjectRecord } from 'twenty-shared/types';

import { CommonRecordQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-record-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type CommonQueryRunResult } from 'src/engine/api/common/types/common-query-result.type';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import {
  CommonExtendedInput,
  CommonInput,
  CommonQueryNames,
  UpdateManyQueryArgs,
  UpdateOneQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';

@Injectable()
export class CommonUpdateManyQueryRunnerService extends CommonRecordQueryRunnerService<
  UpdateManyQueryArgs,
  ObjectRecord[]
> {
  protected readonly operationName = CommonQueryNames.UPDATE_MANY;

  async run(
    args: CommonExtendedInput<UpdateManyQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<CommonQueryRunResult<ObjectRecord[]>> {
    return this.runFilteredMutation({
      queryRunnerContext,
      filter: args.filter,
      selection: args.selectedFieldsResult,
      kind: 'update',
      data: args.data,
    });
  }

  async runOnOneRecord(
    args: Pick<
      CommonExtendedInput<UpdateOneQueryArgs>,
      'id' | 'data' | 'selectedFieldsResult'
    >,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<CommonQueryRunResult<ObjectRecord[]>> {
    return this.runFilteredMutation({
      queryRunnerContext,
      filter: { id: { eq: args.id } },
      selection: args.selectedFieldsResult,
      kind: 'update',
      data: args.data,
      shouldWriteAtLeastOneRecord: true,
    });
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
}
