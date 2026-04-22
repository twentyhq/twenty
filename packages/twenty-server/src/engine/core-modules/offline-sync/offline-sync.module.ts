import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OfflineSyncService } from './offline-sync.service';
import { OfflineSyncController } from './offline-sync.controller';
import {
  OfflineChangeEntity,
  OfflineConflictEntity,
  OfflineClientEntity,
} from './offline-sync.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OfflineChangeEntity,
      OfflineConflictEntity,
      OfflineClientEntity,
    ]),
  ],
  controllers: [OfflineSyncController],
  providers: [OfflineSyncService],
  exports: [OfflineSyncService],
})
export class OfflineSyncModule {}
