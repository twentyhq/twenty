import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade-migration/services/upgrade-migration.service';
import { UpgradeMigrationEntity } from 'src/engine/core-modules/upgrade-migration/upgrade-migration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UpgradeMigrationEntity])],
  providers: [UpgradeMigrationService],
  exports: [UpgradeMigrationService],
})
export class UpgradeMigrationModule {}
