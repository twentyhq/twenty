import { Module } from '@nestjs/common';

import { CoreMigrationRunnerService } from 'src/database/commands/core-migration-runner/services/core-migration-runner.service';
import { VersionedMigrationRegistryService } from 'src/database/commands/core-migration-runner/services/versioned-migration-registry.service';

@Module({
  providers: [CoreMigrationRunnerService, VersionedMigrationRegistryService],
  exports: [CoreMigrationRunnerService, VersionedMigrationRegistryService],
})
export class CoreMigrationRunnerModule {}
