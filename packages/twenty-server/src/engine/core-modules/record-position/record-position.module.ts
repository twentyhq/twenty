import { Module } from '@nestjs/common';

import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

import { RecordPositionService } from './services/record-position.service';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [RecordPositionService],
  exports: [RecordPositionService],
})
export class RecordPositionModule {}
