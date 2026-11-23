import { msg } from '@lingui/core/macro';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CommonRecordQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-record-query-runner.service';
import { type CommonFilteredMutationManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-filtered-mutation-many-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import { type CommonQueryRunResult } from 'src/engine/api/common/types/common-query-result.type';
import {
  CommonExtendedInput,
  CommonInput,
  DeleteOneQueryArgs,
  DestroyOneQueryArgs,
  RestoreOneQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';

type FilteredMutationOneQueryArgs =
  | DeleteOneQueryArgs
  | DestroyOneQueryArgs
  | RestoreOneQueryArgs;

export abstract class CommonFilteredMutationOneQueryRunnerService extends CommonRecordQueryRunnerService<
  FilteredMutationOneQueryArgs,
  ObjectRecord
> {
  constructor(
    private readonly manyQueryRunnerService: CommonFilteredMutationManyQueryRunnerService,
  ) {
    super();
  }

  async run(
    args: CommonExtendedInput<FilteredMutationOneQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<CommonQueryRunResult<ObjectRecord>> {
    const { result, relationAggregatedValues } =
      await this.manyQueryRunnerService.runOnOneRecord(
        args,
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
    args: CommonInput<FilteredMutationOneQueryArgs>,
    _queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<FilteredMutationOneQueryArgs>> {
    return args;
  }

  async validate(
    args: CommonInput<FilteredMutationOneQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<void> {
    const { flatObjectMetadata } = queryRunnerContext;

    assertMutationNotOnRemoteObject(flatObjectMetadata);
    assertIsValidUuid(args.id);
  }
}
