import { Module } from '@nestjs/common';

import { DuplicateService } from 'src/engine/core-modules/duplicate/duplicate.service';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  exports: [DuplicateService],
  providers: [DuplicateService],
})
export class DuplicateModule {}
