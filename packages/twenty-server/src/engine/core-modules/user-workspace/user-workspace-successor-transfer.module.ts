import { Module } from '@nestjs/common';

import { UserWorkspaceSuccessorTransferService } from 'src/engine/core-modules/user-workspace/services/user-workspace-successor-transfer.service';
import { ConnectedAccountMetadataModule } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.module';
import { PrivateMetadataSuccessorTransferModule } from 'src/engine/permissions/metadata-permissions/private-metadata-successor-transfer.module';
import { RecordShareModule } from 'src/engine/permissions/record-share/record-share.module';

@Module({
  imports: [
    ConnectedAccountMetadataModule,
    RecordShareModule,
    PrivateMetadataSuccessorTransferModule,
  ],
  providers: [UserWorkspaceSuccessorTransferService],
  exports: [UserWorkspaceSuccessorTransferService],
})
export class UserWorkspaceSuccessorTransferModule {}
