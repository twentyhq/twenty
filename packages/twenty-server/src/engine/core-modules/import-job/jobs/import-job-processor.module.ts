import { Module } from '@nestjs/common';

import { ImportJobModule } from 'src/engine/core-modules/import-job/import-job.module';
import { ImportJobProcessor } from 'src/engine/core-modules/import-job/jobs/import-job.processor';

@Module({
  imports: [ImportJobModule],
  providers: [ImportJobProcessor],
})
export class ImportJobProcessorModule {}
