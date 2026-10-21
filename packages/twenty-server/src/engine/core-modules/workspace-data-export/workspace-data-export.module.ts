import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { GenerateWorkspaceDataExportJob } from 'src/engine/core-modules/workspace-data-export/jobs/generate-workspace-data-export.job';
import { WorkspaceDataExportService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity, WorkspaceEntity]),
    FileUrlModule,
    WorkspaceCacheModule,
  ],
  providers: [
    WorkspaceDataExportService,
    GenerateWorkspaceDataExportJob,
    provideWorkspaceScopedRepository(FileEntity),
  ],
  exports: [WorkspaceDataExportService],
})
export class WorkspaceDataExportModule {}
