import { AgentHistoryMigrationDataService } from 'src/database/commands/agent-history/agent-history-migration-data.service';
import { AgentHistoryMigrationValidationService } from 'src/database/commands/agent-history/agent-history-migration-validation.service';
import { AgentHistoryCleanupCommand } from 'src/database/commands/agent-history/agent-history-cleanup.command';
import { AgentHistoryDefaultCommand } from 'src/database/commands/agent-history/agent-history-default.command';
import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AgentHistoryMigrateCommand } from 'src/database/commands/agent-history/agent-history-migrate.command';
import { AgentHistoryMigrationService } from 'src/database/commands/agent-history/agent-history-migration.service';
import { AgentHistorySchemaService } from 'src/database/commands/agent-history/agent-history-schema.service';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  exports: [AgentHistorySchemaService, AgentHistoryMigrationService],
  imports: [
    WorkspaceIteratorModule,
    AgentHistoryModule,
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    AgentHistoryCleanupCommand,
    AgentHistoryDefaultCommand,
    AgentHistoryMigrateCommand,
    AgentHistoryMigrationService,
    AgentHistoryMigrationDataService,
    AgentHistoryMigrationValidationService,
    AgentHistorySchemaService,
  ],
})
export class AgentHistoryMigrationModule {}
