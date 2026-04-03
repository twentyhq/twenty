import { Module } from '@nestjs/common';

import { CoreMigrationGeneratorService } from 'src/database/commands/core-migration/services/core-migration-generator.service';
import { CoreMigrationRunnerService } from 'src/database/commands/core-migration/services/core-migration-runner.service';
import { RegisteredCoreMigrationService } from 'src/database/commands/core-migration/services/registered-core-migration-registry.service';

@Module({
  providers: [
    CoreMigrationGeneratorService,
    CoreMigrationRunnerService,
    RegisteredCoreMigrationService,
  ],
  exports: [
    CoreMigrationGeneratorService,
    CoreMigrationRunnerService,
    RegisteredCoreMigrationService,
  ],
})
export class CoreMigrationModule {}
