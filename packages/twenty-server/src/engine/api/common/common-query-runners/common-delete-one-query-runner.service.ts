import { Injectable } from '@nestjs/common';

import { CommonDeleteManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-delete-many-query-runner.service';
import { CommonFilteredMutationOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-filtered-mutation-one-query-runner.service';
import { CommonQueryNames } from 'src/engine/api/common/types/common-query-args.type';

@Injectable()
export class CommonDeleteOneQueryRunnerService extends CommonFilteredMutationOneQueryRunnerService {
  constructor(
    commonDeleteManyQueryRunnerService: CommonDeleteManyQueryRunnerService,
  ) {
    super(commonDeleteManyQueryRunnerService);
  }

  protected readonly operationName = CommonQueryNames.DELETE_ONE;
}
