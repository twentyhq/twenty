import { CommonFindManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-many-query-runner.service';
import { CommonFindOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-one-query-runner.service';

export const CommonQueryRunners = [
  CommonFindOneQueryRunnerService,
  CommonFindManyQueryRunnerService,
];
