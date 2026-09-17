import { RecordExportStreamWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export-stream.workspace-service';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { RecordExportCacheService } from 'src/engine/core-modules/record-export/services/record-export-cache.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { UserSessionModule } from 'src/engine/core-modules/user-session/user-session.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { RecordExportSecurityService } from 'src/engine/core-modules/record-export/services/record-export-security.service';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { CoreCommonApiModule } from 'src/engine/api/common/core-common-api.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { GenerateRecordExportJob } from 'src/engine/core-modules/record-export/jobs/generate-record-export.job';
import { RecordExportController } from 'src/engine/core-modules/record-export/record-export.controller';
import { RecordExportResolver } from 'src/engine/core-modules/record-export/record-export.resolver';
import { RecordExportQueryWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export-query.workspace-service';
import { RecordExportWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export.workspace-service';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { ApplicationTranslationCatalogModule } from 'src/engine/metadata-modules/application-translation-catalog/application-translation-catalog.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    TokenModule,
    UserSessionModule,
    WorkspaceCacheStorageModule,
    CoreCommonApiModule,
    FeatureFlagModule,
    JwtModule,
    UserWorkspaceModule,
    PermissionsModule,
    ApplicationTranslationCatalogModule,
    WorkspaceCacheModule,
  ],
  controllers: [RecordExportController],
  providers: [
    RecordExportSecurityService,
    RecordExportResolver,
    RecordExportStreamWorkspaceService,
    RecordExportCacheService,
    provideWorkspaceScopedRepository(FileEntity),
    RecordExportWorkspaceService,
    RecordExportQueryWorkspaceService,
    GenerateRecordExportJob,
  ],
})
export class RecordExportModule {}
