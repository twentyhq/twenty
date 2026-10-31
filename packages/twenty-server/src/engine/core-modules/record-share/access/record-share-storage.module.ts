import { Module } from '@nestjs/common';

import { PrivateRecordStorageService } from 'src/engine/core-modules/record-share/access/services/private-record-storage.service';
import { RecordShareStorageService } from 'src/engine/core-modules/record-share/access/services/record-share-storage.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule],
  providers: [RecordShareStorageService, PrivateRecordStorageService],
  exports: [RecordShareStorageService, PrivateRecordStorageService],
})
export class RecordShareStorageModule {}
