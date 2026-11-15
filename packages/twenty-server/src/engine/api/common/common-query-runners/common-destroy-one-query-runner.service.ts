import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import { CommonDestroyManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-destroy-many-query-runner.service';
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
  DestroyOneQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { type CommonQueryResultProcessingArgs } from 'src/engine/api/common/types/common-query-result-processing-args.type';

@Injectable()
export class CommonDestroyOneQueryRunnerService extends CommonBaseQueryRunnerService<
  DestroyOneQueryArgs,
  ObjectRecord
> {
  constructor(
    private readonly commonDestroyManyQueryRunnerService: CommonDestroyManyQueryRunnerService,
  ) {
    super();
  }

  protected readonly operationName = CommonQueryNames.DESTROY_ONE;

  async run(
    args: CommonExtendedInput<DestroyOneQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<ObjectRecord> {
    const result = await this.commonDestroyManyQueryRunnerService.run(
      {
        ...args,
        filter: { id: { eq: args.id } },
      },
      queryRunnerContext,
    );

    if (!isDefined(result) || result.length === 0) {
      throw new CommonQueryRunnerException(
        'Record not found',
        CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
        {
          userFriendlyMessage: msg`This record does not exist or has been deleted.`,
        },
      );
    }

    return result[0];
  }

  async computeArgs(
    args: CommonInput<DestroyOneQueryArgs>,
    _queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<DestroyOneQueryArgs>> {
    return args;
  }

  async processQueryResult({
    queryResult,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    authContext,
    relationSelections,
  }: CommonQueryResultProcessingArgs<ObjectRecord>): Promise<ObjectRecord> {
    return this.commonResultGettersService.processRecord({
      record: queryResult,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      workspaceId: authContext.workspace.id,
      relationSelections,
    });
  }

  async validate(
    args: CommonInput<DestroyOneQueryArgs>,
    _queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<void> {
    if (!isDefined(args.id)) {
      throw new CommonQueryRunnerException(
        'Missing id',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }
  }
}
