import { Module } from '@nestjs/common';

import { KeyValuePairModule } from 'src/engine/core-modules/key-value-pair/key-value-pair.module';
import { WorkspaceStateService } from 'src/engine/core-modules/workspace-state/workspace-state.service';

@Module({
  imports: [KeyValuePairModule],
  exports: [WorkspaceStateService],
  providers: [WorkspaceStateService],
})
export class WorkspaceStateModule {}
