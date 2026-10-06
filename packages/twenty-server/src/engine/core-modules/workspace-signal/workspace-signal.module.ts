import { Module } from '@nestjs/common';

import { WorkspaceSignalService } from 'src/engine/core-modules/workspace-signal/services/workspace-signal.service';

@Module({
  providers: [WorkspaceSignalService],
  exports: [WorkspaceSignalService],
})
export class WorkspaceSignalModule {}
