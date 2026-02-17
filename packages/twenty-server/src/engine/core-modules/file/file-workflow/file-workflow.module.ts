import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { FileWorkflowResolver } from 'src/engine/core-modules/file/file-workflow/resolvers/file-workflow.resolver';
import { FileWorkflowService } from 'src/engine/core-modules/file/file-workflow/services/file-workflow.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [FileUrlModule, ApplicationModule, PermissionsModule],
  providers: [FileWorkflowService, FileWorkflowResolver],
  exports: [FileWorkflowService],
})
export class FileWorkflowModule {}
