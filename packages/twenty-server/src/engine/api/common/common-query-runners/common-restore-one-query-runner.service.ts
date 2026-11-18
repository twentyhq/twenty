import { Injectable } from '@nestjs/common';

import { CommonRestoreManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-restore-many-query-runner.service';
import { CommonFilteredMutationOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-filtered-mutation-one-query-runner.service';
import { CommonQueryNames } from 'src/engine/api/common/types/common-query-args.type';

@Injectable()
export class CommonRestoreOneQueryRunnerService extends CommonFilteredMutationOneQueryRunnerService {
  constructor(
    commonRestoreManyQueryRunnerService: CommonRestoreManyQueryRunnerService,
  ) {
    super(commonRestoreManyQueryRunnerService);
  }

  protected readonly operationName = CommonQueryNames.RESTORE_ONE;
}
