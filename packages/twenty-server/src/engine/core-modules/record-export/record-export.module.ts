import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { CoreCommonApiModule } from 'src/engine/api/common/core-common-api.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { GenerateRecordExportJob } from 'src/engine/core-modules/record-export/jobs/generate-record-export.job';
import { RecordExportResolver } from 'src/engine/core-modules/record-export/record-export.resolver';
import { RecordExportQueryService } from 'src/engine/core-modules/record-export/services/record-export-query.service';
import { RecordExportWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export.workspace-service';
import { UserSessionModule } from 'src/engine/core-modules/user-session/user-session.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { ApplicationTranslationCatalogModule } from 'src/engine/metadata-modules/application-translation-catalog/application-translation-catalog.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    UserSessionModule,
    CoreCommonApiModule,
    CoreEntityCacheModule,
    JwtModule,
    UserWorkspaceModule,
    PermissionsModule,
    ApplicationTranslationCatalogModule,
    WorkspaceCacheModule,
  ],
  exports: [RecordExportWorkspaceService, RecordExportQueryService],
  providers: [
    RecordExportResolver,
    provideWorkspaceScopedRepository(FileEntity),
    RecordExportWorkspaceService,
    RecordExportQueryService,
    GenerateRecordExportJob,
  ],
})
export class RecordExportModule {}
