import { Module } from '@nestjs/common';

import { WorkspaceMemberService } from 'src/engine-workspace/repositories/workspace-member/workspace-member.service';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [WorkspaceMemberService],
  exports: [WorkspaceMemberService],
})
export class WorkspaceMemberModule {}
