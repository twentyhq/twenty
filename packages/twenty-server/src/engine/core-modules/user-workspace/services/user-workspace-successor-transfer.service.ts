import { Injectable } from '@nestjs/common';

import { PrivateAgentSuccessorTransferService } from 'src/engine/metadata-modules/ai/ai-agent/services/private-agent-successor-transfer.service';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { PrivateCoreWorkflowSuccessorTransferService } from 'src/engine/core-modules/workflow/services/private-core-workflow-successor-transfer.service';
import { ConnectedAccountOwnershipTransferService } from 'src/engine/metadata-modules/connected-account/services/connected-account-ownership-transfer.service';
import { PrivateViewSuccessorTransferService } from 'src/engine/metadata-modules/view/services/private-view-successor-transfer.service';
import { RecordShareSystemWriteService } from 'src/engine/permissions/record-share/services/record-share-system-write.service';

@Injectable()
export class UserWorkspaceSuccessorTransferService {
  constructor(
    private readonly connectedAccountOwnershipTransferService: ConnectedAccountOwnershipTransferService,
    private readonly recordShareSystemWriteService: RecordShareSystemWriteService,
    private readonly privateViewSuccessorTransferService: PrivateViewSuccessorTransferService,
    private readonly privateCoreWorkflowSuccessorTransferService: PrivateCoreWorkflowSuccessorTransferService,
    private readonly privateAgentSuccessorTransferService: PrivateAgentSuccessorTransferService,
  ) {}

  async transferToSuccessor({
    removedUserWorkspace,
    removedWorkspaceMemberId,
    actingUserWorkspaceId,
  }: {
    removedUserWorkspace: UserWorkspaceEntity;
    removedWorkspaceMemberId: string;
    actingUserWorkspaceId?: string;
  }): Promise<void> {
    await this.connectedAccountOwnershipTransferService.transferConnectedAccountsOwnershipToSuccessor(
      {
        removedUserWorkspace,
        actingUserWorkspaceId,
      },
    );

    await this.recordShareSystemWriteService.transferRecordSharesToSuccessor({
      removedUserWorkspace,
      removedWorkspaceMemberId,
      actingUserWorkspaceId,
    });

    await this.privateViewSuccessorTransferService.transferPrivateViewsToSuccessor(
      {
        removedUserWorkspace,
        actingUserWorkspaceId,
      },
    );

    await this.privateCoreWorkflowSuccessorTransferService.transferPrivateWorkflowsToSuccessor(
      {
        removedUserWorkspace,
        actingUserWorkspaceId,
      },
    );

    await this.privateAgentSuccessorTransferService.transferPrivateAgentsToSuccessor(
      {
        removedUserWorkspace,
        actingUserWorkspaceId,
      },
    );
  }
}
