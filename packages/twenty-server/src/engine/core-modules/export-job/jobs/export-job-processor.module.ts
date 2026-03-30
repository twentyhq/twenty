import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ExportJobModule } from 'src/engine/core-modules/export-job/export-job.module';
import { ExportJobProcessor } from 'src/engine/core-modules/export-job/jobs/export-job.processor';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [ExportJobModule, FileUrlModule, ApplicationModule, WorkspaceCacheModule],
  providers: [ExportJobProcessor],
})
export class ExportJobProcessorModule {}
