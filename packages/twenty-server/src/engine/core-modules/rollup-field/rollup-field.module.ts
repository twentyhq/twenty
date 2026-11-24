import { Module } from '@nestjs/common';

import { CoreCommonApiModule } from 'src/engine/api/common/core-common-api.module';
import { ComputeRollupFieldsDeferredOperationHandlerService } from 'src/engine/core-modules/rollup-field/deferred-operation-handlers/compute-rollup-fields-deferred-operation-handler.service';
import { BackfillRollupFieldsJob } from 'src/engine/core-modules/rollup-field/jobs/backfill-rollup-fields.job';
import { RollupFieldComputationService } from 'src/engine/core-modules/rollup-field/services/rollup-field-computation.service';

@Module({
  imports: [CoreCommonApiModule],
  providers: [
    RollupFieldComputationService,
    ComputeRollupFieldsDeferredOperationHandlerService,
    BackfillRollupFieldsJob,
  ],
})
export class RollupFieldModule {}
