import { Module } from '@nestjs/common';

import { CoreMigrationRunnerService } from 'src/database/commands/core-migration-runner/services/core-migration-runner.service';

@Module({
  providers: [CoreMigrationRunnerService],
  exports: [CoreMigrationRunnerService],
})
export class CoreMigrationRunnerModule {}
