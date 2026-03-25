import { CommonCreateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/common-create-many-query-runner.service';
import { CommonCreateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-one-query-runner.service';
import { CommonDeleteManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-delete-many-query-runner.service';
import { CommonDeleteOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-delete-one-query-runner.service';
import { CommonDestroyManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-destroy-many-query-runner.service';
import { CommonDestroyOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-destroy-one-query-runner.service';
import { CommonFindDuplicatesQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-duplicates-query-runner.service';
import { CommonFindManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-many-query-runner.service';
import { CommonFindOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-one-query-runner.service';
import { CommonGroupByQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-group-by-query-runner.service';
import { CommonMergeManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-merge-many-query-runner.service';
import { CommonRestoreManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-restore-many-query-runner.service';
import { CommonRestoreOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-restore-one-query-runner.service';
import { CommonUpdateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-update-many-query-runner.service';
import { CommonUpdateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-update-one-query-runner.service';

export const CommonQueryRunners = [
  CommonCreateOneQueryRunnerService,
  CommonCreateManyQueryRunnerService,
  CommonFindManyQueryRunnerService,
  CommonFindOneQueryRunnerService,
  CommonGroupByQueryRunnerService,
  CommonUpdateOneQueryRunnerService,
  CommonUpdateManyQueryRunnerService,
  CommonDestroyManyQueryRunnerService,
  CommonDestroyOneQueryRunnerService,
  CommonDeleteManyQueryRunnerService,
  CommonDeleteOneQueryRunnerService,
  CommonFindDuplicatesQueryRunnerService,
  CommonRestoreManyQueryRunnerService,
  CommonRestoreOneQueryRunnerService,
  CommonMergeManyQueryRunnerService,
];
