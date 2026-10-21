import { AgentHistoryUpgradeStorageService } from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';
import { AgentHistoryMigrationDataService } from 'src/database/commands/agent-history/agent-history-migration-data.service';
import { AgentHistoryMigrationValidationService } from 'src/database/commands/agent-history/agent-history-migration-validation.service';
import { Module } from '@nestjs/common';

import { AgentHistoryMigrationService } from 'src/database/commands/agent-history/agent-history-migration.service';
import { AgentHistorySchemaService } from 'src/database/commands/agent-history/agent-history-schema.service';
import { AgentHistoryMigrationStateService } from 'src/database/commands/agent-history/agent-history-migration-state.service';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  exports: [
    AgentHistoryUpgradeStorageService,
    AgentHistorySchemaService,
    AgentHistoryMigrationService,
    AgentHistoryMigrationStateService,
  ],
  imports: [ApplicationModule, WorkspaceCacheModule, WorkspaceMigrationModule],
  providers: [
    AgentHistoryUpgradeStorageService,
    AgentHistoryMigrationService,
    AgentHistoryMigrationStateService,
    AgentHistoryMigrationDataService,
    AgentHistoryMigrationValidationService,
    AgentHistorySchemaService,
  ],
})
export class AgentHistoryMigrationModule {}
