import { Injectable } from '@nestjs/common';

import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { CoreWorkflowOwnershipTransferService } from 'src/engine/core-modules/workflow/services/core-workflow-ownership-transfer.service';
import { ConnectedAccountOwnershipTransferService } from 'src/engine/metadata-modules/connected-account/services/connected-account-ownership-transfer.service';
import { ViewOwnershipTransferService } from 'src/engine/metadata-modules/view/services/view-ownership-transfer.service';
import { RecordShareSystemWriteService } from 'src/engine/permissions/record-share/services/record-share-system-write.service';

@Injectable()
export class UserWorkspaceSuccessorTransferService {
  constructor(
    private readonly connectedAccountOwnershipTransferService: ConnectedAccountOwnershipTransferService,
    private readonly recordShareSystemWriteService: RecordShareSystemWriteService,
    private readonly viewOwnershipTransferService: ViewOwnershipTransferService,
    private readonly coreWorkflowOwnershipTransferService: CoreWorkflowOwnershipTransferService,
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

    await this.viewOwnershipTransferService.transferPrivateViewsToSuccessor({
      removedUserWorkspace,
      actingUserWorkspaceId,
    });

    await this.coreWorkflowOwnershipTransferService.transferPrivateWorkflowsToSuccessor(
      {
        removedUserWorkspace,
        actingUserWorkspaceId,
      },
    );
  }
}
