import { Module } from '@nestjs/common';

import { UserWorkspaceSuccessorTransferService } from 'src/engine/core-modules/user-workspace/services/user-workspace-successor-transfer.service';
import { CoreWorkflowOwnershipTransferModule } from 'src/engine/core-modules/workflow/core-workflow-ownership-transfer.module';
import { AgentOwnershipTransferModule } from 'src/engine/metadata-modules/ai/ai-agent/agent-ownership-transfer.module';
import { ConnectedAccountMetadataModule } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.module';
import { ViewOwnershipTransferModule } from 'src/engine/metadata-modules/view/view-ownership-transfer.module';
import { RecordShareModule } from 'src/engine/permissions/record-share/record-share.module';

@Module({
  imports: [
    ConnectedAccountMetadataModule,
    RecordShareModule,
    ViewOwnershipTransferModule,
    CoreWorkflowOwnershipTransferModule,
    AgentOwnershipTransferModule,
  ],
  providers: [UserWorkspaceSuccessorTransferService],
  exports: [UserWorkspaceSuccessorTransferService],
})
export class UserWorkspaceSuccessorTransferModule {}
