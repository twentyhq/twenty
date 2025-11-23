import { Module } from '@nestjs/common';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { WorkspaceMemberResolver } from 'src/engine/core-modules/workspace-member/workspace-member.resolver';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [FileUploadModule, PermissionsModule, TypeORMModule],
  providers: [WorkspaceMemberResolver],
})
export class WorkspaceMemberModule {}
