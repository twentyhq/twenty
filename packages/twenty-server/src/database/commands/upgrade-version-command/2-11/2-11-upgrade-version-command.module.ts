import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { ReassignWorkflowCreatorToEmailAccountOwnerCommand } from 'src/database/commands/upgrade-version-command/2-11/2-11-workspace-command-1799100000000-reassign-workflow-creator-to-email-account-owner.command';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConnectedAccountEntity, UserWorkspaceEntity]),
    WorkspaceIteratorModule,
  ],
  providers: [ReassignWorkflowCreatorToEmailAccountOwnerCommand],
})
export class V2_11_UpgradeVersionCommandModule {}
