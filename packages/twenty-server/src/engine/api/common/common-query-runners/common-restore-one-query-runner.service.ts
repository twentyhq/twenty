import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import { CommonRestoreManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-restore-many-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type CommonQueryRunResult } from 'src/engine/api/common/types/common-query-result.type';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import {
  CommonExtendedInput,
  CommonInput,
  CommonQueryNames,
  RestoreOneQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';

@Injectable()
export class CommonRestoreOneQueryRunnerService extends CommonBaseQueryRunnerService<
  RestoreOneQueryArgs,
  ObjectRecord
> {
  constructor(
    private readonly commonRestoreManyQueryRunnerService: CommonRestoreManyQueryRunnerService,
  ) {
    super();
  }

  protected readonly operationName = CommonQueryNames.RESTORE_ONE;

  async run(
    args: CommonExtendedInput<RestoreOneQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<CommonQueryRunResult<ObjectRecord>> {
    const { result, relationAggregatedValues } =
      await this.commonRestoreManyQueryRunnerService.run(
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

    return { result: result[0], relationAggregatedValues };
  }

  async computeArgs(
    args: CommonInput<RestoreOneQueryArgs>,
    _queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<RestoreOneQueryArgs>> {
    return args;
  }

  async validate(
    args: CommonInput<RestoreOneQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<void> {
    const { flatObjectMetadata } = queryRunnerContext;

    assertMutationNotOnRemoteObject(flatObjectMetadata);
    assertIsValidUuid(args.id);
  }
}
