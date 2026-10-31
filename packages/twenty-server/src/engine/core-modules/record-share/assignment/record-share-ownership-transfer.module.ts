import { Module } from '@nestjs/common';

import { RecordShareStorageModule } from 'src/engine/core-modules/record-share/access/record-share-storage.module';
import { RecordShareOwnershipTransferService } from 'src/engine/core-modules/record-share/assignment/services/record-share-ownership-transfer.service';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [RecordShareStorageModule, UserRoleModule, WorkspaceCacheModule],
  providers: [RecordShareOwnershipTransferService],
  exports: [RecordShareOwnershipTransferService],
})
export class RecordShareOwnershipTransferModule {}
