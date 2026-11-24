import { Module } from '@nestjs/common';

import { UserWorkspaceSuccessorTransferService } from 'src/engine/core-modules/user-workspace/services/user-workspace-successor-transfer.service';
import { PrivateCoreWorkflowSuccessorTransferModule } from 'src/engine/core-modules/workflow/private-core-workflow-successor-transfer.module';
import { PrivateAgentSuccessorTransferModule } from 'src/engine/metadata-modules/ai/ai-agent/private-agent-successor-transfer.module';
import { ConnectedAccountMetadataModule } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.module';
import { PrivateViewSuccessorTransferModule } from 'src/engine/metadata-modules/view/private-view-successor-transfer.module';
import { RecordShareModule } from 'src/engine/permissions/record-share/record-share.module';

@Module({
  imports: [
    ConnectedAccountMetadataModule,
    RecordShareModule,
    PrivateViewSuccessorTransferModule,
    PrivateCoreWorkflowSuccessorTransferModule,
    PrivateAgentSuccessorTransferModule,
  ],
  providers: [UserWorkspaceSuccessorTransferService],
  exports: [UserWorkspaceSuccessorTransferService],
})
export class UserWorkspaceSuccessorTransferModule {}
