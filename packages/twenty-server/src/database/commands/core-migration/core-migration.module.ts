import { Module } from '@nestjs/common';

import { CoreMigrationGeneratorService } from 'src/database/commands/core-migration/services/core-migration-generator.service';
import { RegisteredCoreMigrationService } from 'src/database/commands/core-migration/services/registered-core-migration-registry.service';
import { InstanceUpgradeModule } from 'src/engine/core-modules/instance-upgrade/instance-upgrade.module';

@Module({
  imports: [InstanceUpgradeModule],
  providers: [
    CoreMigrationGeneratorService,
    RegisteredCoreMigrationService,
  ],
  exports: [
    CoreMigrationGeneratorService,
    RegisteredCoreMigrationService,
    InstanceUpgradeModule,
  ],
})
export class CoreMigrationModule {}
