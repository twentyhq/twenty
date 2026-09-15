import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreCommonApiModule } from 'src/engine/api/common/core-common-api.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { RecordExportCleanupCronCommand } from 'src/engine/core-modules/record-export/crons/record-export-cleanup.cron.command';
import { RecordExportCleanupCronJob } from 'src/engine/core-modules/record-export/crons/record-export-cleanup.cron.job';
import { GenerateRecordExportJob } from 'src/engine/core-modules/record-export/jobs/generate-record-export.job';
import { RecordExportController } from 'src/engine/core-modules/record-export/record-export.controller';
import { RecordExportEntity } from 'src/engine/core-modules/record-export/record-export.entity';
import { RecordExportResolver } from 'src/engine/core-modules/record-export/record-export.resolver';
import { RecordExportQueryWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export-query.workspace-service';
import { RecordExportWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export.workspace-service';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { ApplicationTranslationCatalogModule } from 'src/engine/metadata-modules/application-translation-catalog/application-translation-catalog.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecordExportEntity]),
    CoreCommonApiModule,
    JwtModule,
    UserWorkspaceModule,
    PermissionsModule,
    ApplicationTranslationCatalogModule,
    WorkspaceCacheModule,
  ],
  controllers: [RecordExportController],
  providers: [
    RecordExportResolver,
    RecordExportWorkspaceService,
    RecordExportQueryWorkspaceService,
    GenerateRecordExportJob,
    RecordExportCleanupCronJob,
    RecordExportCleanupCronCommand,
    provideWorkspaceScopedRepository(RecordExportEntity),
  ],
  exports: [RecordExportCleanupCronCommand],
})
export class RecordExportModule {}
