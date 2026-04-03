import { Module } from '@nestjs/common';

import { CoreMigrationGeneratorService } from 'src/database/commands/core-migration-runner/services/core-migration-generator.service';
import { CoreMigrationRunnerService } from 'src/database/commands/core-migration-runner/services/core-migration-runner.service';
import { VersionedMigrationRegistryService } from 'src/database/commands/core-migration-runner/services/versioned-migration-registry.service';

@Module({
  providers: [
    CoreMigrationGeneratorService,
    CoreMigrationRunnerService,
    VersionedMigrationRegistryService,
  ],
  exports: [
    CoreMigrationGeneratorService,
    CoreMigrationRunnerService,
    VersionedMigrationRegistryService,
  ],
})
export class CoreMigrationRunnerModule {}
