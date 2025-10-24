import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import { CommonDestroyManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-destroy-many-query-runner.service';
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
  DestroyOneQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

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

  async processQueryResult(
    queryResult: ObjectRecord,
    _objectMetadataItemId: string,
    _objectMetadataMaps: ObjectMetadataMaps,
    _authContext: WorkspaceAuthContext,
  ): Promise<ObjectRecord> {
    return queryResult;
  }

  async validate(
    args: CommonInput<DestroyOneQueryArgs>,
    _queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<void> {
    if (!isDefined(args.id)) {
      throw new CommonQueryRunnerException(
        'Missing id',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }
  }
}
