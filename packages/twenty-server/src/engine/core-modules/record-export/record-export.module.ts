import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { GenerateRecordExportJob } from 'src/engine/core-modules/record-export/jobs/generate-record-export.job';
import { RecordExportResolver } from 'src/engine/core-modules/record-export/record-export.resolver';
import { RecordExportWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export.workspace-service';
import { TrackedJobModule } from 'src/engine/core-modules/tracked-job/tracked-job.module';
import { UserSessionModule } from 'src/engine/core-modules/user-session/user-session.module';
import { ApplicationTranslationCatalogModule } from 'src/engine/metadata-modules/application-translation-catalog/application-translation-catalog.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    UserSessionModule,
    FeatureFlagModule,
    JwtModule,
    PermissionsModule,
    TrackedJobModule,
    ApplicationTranslationCatalogModule,
    WorkspaceCacheModule,
  ],
  exports: [RecordExportWorkspaceService],
  providers: [
    RecordExportResolver,
    provideWorkspaceScopedRepository(FileEntity),
    RecordExportWorkspaceService,
    GenerateRecordExportJob,
  ],
})
export class RecordExportModule {}
