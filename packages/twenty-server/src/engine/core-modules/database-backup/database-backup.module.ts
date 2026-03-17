import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { DatabaseBackupService } from './database-backup.service';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

import { DatabaseBackupController } from './database-backup.controller';

@Module({
  imports: [
    TwentyConfigModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [DatabaseBackupController],
  providers: [DatabaseBackupService],
  exports: [DatabaseBackupService],
})
export class DatabaseBackupModule {}
