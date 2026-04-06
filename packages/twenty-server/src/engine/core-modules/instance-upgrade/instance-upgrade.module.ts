import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InstanceUpgradeEntity } from 'src/engine/core-modules/instance-upgrade/instance-upgrade.entity';
import { InstanceUpgradeService } from 'src/engine/core-modules/instance-upgrade/instance-upgrade.service';

@Module({
  imports: [TypeOrmModule.forFeature([InstanceUpgradeEntity])],
  providers: [InstanceUpgradeService],
  exports: [InstanceUpgradeService],
})
export class InstanceUpgradeModule {}
