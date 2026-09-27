import { Module } from '@nestjs/common';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { CoreCommonApiModule } from 'src/engine/api/common/core-common-api.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { PrepareRecordImportJob } from 'src/engine/core-modules/record-import/jobs/prepare-record-import.job';
import { RunRecordImportJob } from 'src/engine/core-modules/record-import/jobs/run-record-import.job';
import { ValidateRecordImportJob } from 'src/engine/core-modules/record-import/jobs/validate-record-import.job';
import { RecordImportValidationWorkspaceService } from 'src/engine/core-modules/record-import/services/record-import-validation.workspace-service';
import { RecordImportResolver } from 'src/engine/core-modules/record-import/record-import.resolver';
import { RecordImportRunnerWorkspaceService } from 'src/engine/core-modules/record-import/services/record-import-runner.workspace-service';
import { RecordImportSessionService } from 'src/engine/core-modules/record-import/services/record-import-session.service';
import { RecordImportStorageService } from 'src/engine/core-modules/record-import/services/record-import-storage.service';
import { RecordImportWorkspaceService } from 'src/engine/core-modules/record-import/services/record-import.workspace-service';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity, ApplicationEntity]),
    CoreCommonApiModule,
    FeatureFlagModule,
    FileUploadModule,
    FileUrlModule,
    UserWorkspaceModule,
    PermissionsModule,
    WorkspaceCacheModule,
  ],
  exports: [RecordImportSessionService],
  providers: [
    RecordImportResolver,
    provideWorkspaceScopedRepository(FileEntity),
    provideWorkspaceScopedRepository(ApplicationEntity),
    RecordImportSessionService,
    RecordImportStorageService,
    RecordImportWorkspaceService,
    RecordImportRunnerWorkspaceService,
    PrepareRecordImportJob,
    RunRecordImportJob,
    RecordImportValidationWorkspaceService,
    ValidateRecordImportJob,
  ],
})
export class RecordImportModule {}
