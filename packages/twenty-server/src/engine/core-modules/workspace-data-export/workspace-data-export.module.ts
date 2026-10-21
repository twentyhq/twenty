import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { EventLogEmitterModule } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.module';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { RecordExportModule } from 'src/engine/core-modules/record-export/record-export.module';
import { WorkspaceDataExportCleanupCronCommand } from 'src/engine/core-modules/workspace-data-export/crons/commands/workspace-data-export-cleanup.cron.command';
import { WorkspaceDataExportCleanupCronJob } from 'src/engine/core-modules/workspace-data-export/crons/jobs/workspace-data-export-cleanup.cron.job';
import { WorkspaceDataExportStepJob } from 'src/engine/core-modules/workspace-data-export/jobs/workspace-data-export-step.job';
import { WorkspaceDataExportArchiveService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export-archive.service';
import { WorkspaceDataExportCleanupService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export-cleanup.service';
import { WorkspaceDataExportPartWriterService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export-part-writer.service';
import { WorkspaceDataExportStateService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export-state.service';
import { WorkspaceDataExportStepService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export-step.service';
import { WorkspaceDataExportStorageService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export-storage.service';
import { WorkspaceDataExportService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity, WorkspaceEntity]),
    CoreEntityCacheModule,
    EventLogEmitterModule,
    FileUrlModule,
    RecordExportModule,
    WorkspaceCacheModule,
  ],
  providers: [
    WorkspaceDataExportService,
    WorkspaceDataExportStepService,
    WorkspaceDataExportStorageService,
    WorkspaceDataExportStateService,
    WorkspaceDataExportPartWriterService,
    WorkspaceDataExportArchiveService,
    WorkspaceDataExportStepJob,
    WorkspaceDataExportCleanupService,
    WorkspaceDataExportCleanupCronJob,
    WorkspaceDataExportCleanupCronCommand,
    provideWorkspaceScopedRepository(FileEntity),
  ],
  exports: [WorkspaceDataExportService, WorkspaceDataExportCleanupCronCommand],
})
export class WorkspaceDataExportModule {}
