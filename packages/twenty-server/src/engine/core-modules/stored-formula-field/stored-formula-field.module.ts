import { Module } from '@nestjs/common';

import { ComputeStoredFormulaFieldsDeferredOperationHandlerService } from 'src/engine/core-modules/stored-formula-field/deferred-operation-handlers/compute-stored-formula-fields-deferred-operation-handler.service';
import { RecomputeDirtyStoredFormulaRecordsJob } from 'src/engine/core-modules/stored-formula-field/jobs/recompute-dirty-stored-formula-records.job';
import { StoredFormulaFieldRecordEventListener } from 'src/engine/core-modules/stored-formula-field/listeners/stored-formula-field-record-event.listener';
import { StoredFormulaFieldComputationService } from 'src/engine/core-modules/stored-formula-field/services/stored-formula-field-computation.service';
import { StoredFormulaFieldDirtyRecordService } from 'src/engine/core-modules/stored-formula-field/services/stored-formula-field-dirty-record.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [WorkspaceCacheModule, WorkspaceMigrationRunnerModule],
  providers: [
    StoredFormulaFieldComputationService,
    StoredFormulaFieldDirtyRecordService,
    StoredFormulaFieldRecordEventListener,
    ComputeStoredFormulaFieldsDeferredOperationHandlerService,
    RecomputeDirtyStoredFormulaRecordsJob,
  ],
})
export class StoredFormulaFieldModule {}
