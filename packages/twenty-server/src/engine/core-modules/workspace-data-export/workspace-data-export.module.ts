import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventLogEmitterModule } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.module';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { WorkspaceDataExportStepJob } from 'src/engine/core-modules/workspace-data-export/jobs/workspace-data-export-step.job';
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
    EventLogEmitterModule,
    FileUrlModule,
    WorkspaceCacheModule,
  ],
  providers: [
    WorkspaceDataExportService,
    WorkspaceDataExportStepService,
    WorkspaceDataExportStorageService,
    WorkspaceDataExportStateService,
    WorkspaceDataExportStepJob,
    provideWorkspaceScopedRepository(FileEntity),
  ],
  exports: [WorkspaceDataExportService],
})
export class WorkspaceDataExportModule {}
