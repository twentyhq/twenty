import { Injectable } from '@nestjs/common';

import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountOwnershipTransferService } from 'src/engine/metadata-modules/connected-account/services/connected-account-ownership-transfer.service';
import { PrivateMetadataSuccessorTransferService } from 'src/engine/permissions/metadata-permissions/services/private-metadata-successor-transfer.service';
import { RecordShareSystemWriteService } from 'src/engine/permissions/record-share/services/record-share-system-write.service';

@Injectable()
export class UserWorkspaceSuccessorTransferService {
  constructor(
    private readonly connectedAccountOwnershipTransferService: ConnectedAccountOwnershipTransferService,
    private readonly recordShareSystemWriteService: RecordShareSystemWriteService,
    private readonly privateMetadataSuccessorTransferService: PrivateMetadataSuccessorTransferService,
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

    await this.privateMetadataSuccessorTransferService.transferPrivateMetadataToSuccessor(
      {
        removedUserWorkspace,
        actingUserWorkspaceId,
      },
    );
  }
}
