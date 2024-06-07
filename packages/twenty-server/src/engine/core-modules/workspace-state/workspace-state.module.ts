import { Module } from '@nestjs/common';

import { KeyValuePairModule } from 'src/engine/core-modules/key-value-pair/key-value-pair.module';
import { WorkspaceStateService } from 'src/engine/core-modules/workspace-state/workspace-state.service';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';

@Module({
  imports: [KeyValuePairModule, UserWorkspaceModule],
  exports: [WorkspaceStateService],
  providers: [WorkspaceStateService],
})
export class WorkspaceStateModule {}
