import { CommonCreateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/common-create-many-query-runner.service';
import { CommonCreateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-one-query-runner.service';
import { CommonFindDuplicatesQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-duplicates-query-runner.service';
import { CommonFindManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-many-query-runner.service';
import { CommonFindOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-one-query-runner.service';
import { CommonGroupByQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-group-by-query-runner.service';
import { CommonUpdateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-update-many-query-runner.service';
import { CommonUpdateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-update-one-query-runner.service';

export const CommonQueryRunners = [
  CommonCreateOneQueryRunnerService,
  CommonCreateManyQueryRunnerService,
  CommonFindDuplicatesQueryRunnerService,
  CommonFindManyQueryRunnerService,
  CommonFindOneQueryRunnerService,
  CommonGroupByQueryRunnerService,
  CommonUpdateOneQueryRunnerService,
  CommonUpdateManyQueryRunnerService,
];
