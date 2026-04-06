import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InstanceMigrationEntity } from 'src/engine/core-modules/instance-migration/instance-migration.entity';
import { InstanceMigrationService } from 'src/engine/core-modules/instance-migration/instance-migration.service';

@Module({
  imports: [TypeOrmModule.forFeature([InstanceMigrationEntity])],
  providers: [InstanceMigrationService],
  exports: [InstanceMigrationService],
})
export class InstanceMigrationModule {}
