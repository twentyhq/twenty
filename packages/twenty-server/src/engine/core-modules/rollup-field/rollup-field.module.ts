import { Module } from '@nestjs/common';

import { CoreCommonApiModule } from 'src/engine/api/common/core-common-api.module';
import { ReconcileRollupFieldsCronCommand } from 'src/engine/core-modules/rollup-field/commands/reconcile-rollup-fields.cron.command';
import { ReconcileRollupFieldsCronJob } from 'src/engine/core-modules/rollup-field/crons/reconcile-rollup-fields.cron.job';
import { ComputeRollupFieldsDeferredOperationHandlerService } from 'src/engine/core-modules/rollup-field/deferred-operation-handlers/compute-rollup-fields-deferred-operation-handler.service';
import { BackfillRollupFieldsJob } from 'src/engine/core-modules/rollup-field/jobs/backfill-rollup-fields.job';
import { RecomputeDirtyRollupRecordsJob } from 'src/engine/core-modules/rollup-field/jobs/recompute-dirty-rollup-records.job';
import { ReconcileRollupFieldsJob } from 'src/engine/core-modules/rollup-field/jobs/reconcile-rollup-fields.job';
import { RollupFieldRecordEventListener } from 'src/engine/core-modules/rollup-field/listeners/rollup-field-record-event.listener';
import { RollupFieldComputationService } from 'src/engine/core-modules/rollup-field/services/rollup-field-computation.service';
import { RollupFieldDirtyRecordService } from 'src/engine/core-modules/rollup-field/services/rollup-field-dirty-record.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [CoreCommonApiModule, WorkspaceCacheModule],
  providers: [
    RollupFieldComputationService,
    RollupFieldDirtyRecordService,
    RollupFieldRecordEventListener,
    ComputeRollupFieldsDeferredOperationHandlerService,
    BackfillRollupFieldsJob,
    RecomputeDirtyRollupRecordsJob,
    ReconcileRollupFieldsJob,
    ReconcileRollupFieldsCronJob,
    ReconcileRollupFieldsCronCommand,
  ],
  exports: [ReconcileRollupFieldsCronCommand],
})
export class RollupFieldModule {}
