import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { CommonDestroyManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-destroy-many-query-runner.service';
import { CommonFilteredMutationOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-filtered-mutation-one-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import {
  CommonInput,
  CommonQueryNames,
  DestroyOneQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';

@Injectable()
export class CommonDestroyOneQueryRunnerService extends CommonFilteredMutationOneQueryRunnerService {
  constructor(
    commonDestroyManyQueryRunnerService: CommonDestroyManyQueryRunnerService,
  ) {
    super(commonDestroyManyQueryRunnerService);
  }

  protected readonly operationName = CommonQueryNames.DESTROY_ONE;

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
