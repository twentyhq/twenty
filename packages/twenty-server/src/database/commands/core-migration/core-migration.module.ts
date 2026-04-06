import { Module } from '@nestjs/common';

import { CoreMigrationGeneratorService } from 'src/database/commands/core-migration/services/core-migration-generator.service';
import { RegisteredCoreMigrationService } from 'src/database/commands/core-migration/services/registered-core-migration-registry.service';
import { InstanceMigrationModule } from 'src/engine/core-modules/instance-migration/instance-migration.module';

@Module({
  imports: [InstanceMigrationModule],
  providers: [
    CoreMigrationGeneratorService,
    RegisteredCoreMigrationService,
  ],
  exports: [
    CoreMigrationGeneratorService,
    RegisteredCoreMigrationService,
    InstanceMigrationModule,
  ],
})
export class CoreMigrationModule {}
