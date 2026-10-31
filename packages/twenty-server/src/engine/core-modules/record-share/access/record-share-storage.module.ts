import { Module } from '@nestjs/common';

import { RecordShareStorageService } from 'src/engine/core-modules/record-share/access/services/record-share-storage.service';

@Module({
  providers: [RecordShareStorageService],
  exports: [RecordShareStorageService],
})
export class RecordShareStorageModule {}
