import { Injectable } from '@nestjs/common';

import { CommonDestroyManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-destroy-many-query-runner.service';
import { CommonFilteredMutationOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-filtered-mutation-one-query-runner.service';
import { CommonQueryNames } from 'src/engine/api/common/types/common-query-args.type';

@Injectable()
export class CommonDestroyOneQueryRunnerService extends CommonFilteredMutationOneQueryRunnerService {
  constructor(
    commonDestroyManyQueryRunnerService: CommonDestroyManyQueryRunnerService,
  ) {
    super(commonDestroyManyQueryRunnerService);
  }

  protected readonly operationName = CommonQueryNames.DESTROY_ONE;
}
