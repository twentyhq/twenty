import { RecordExportCacheService } from 'src/engine/core-modules/record-export/services/record-export-cache.service';
import { DeleteRecordExportJob } from 'src/engine/core-modules/record-export/jobs/delete-record-export.job';
import { Module } from '@nestjs/common';

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
    RecordExportCacheService,
    DeleteRecordExportJob,
    RecordExportWorkspaceService,
    RecordExportQueryWorkspaceService,
    GenerateRecordExportJob,
  ],
})
export class RecordExportModule {}
