import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileWorkflowService } from 'src/engine/core-modules/file/file-workflow/file-workflow.service';
import { FileWorkflowResolver } from 'src/engine/core-modules/file/file-workflow/resolvers/file-workflow.resolver';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([FileEntity, WorkspaceEntity]),
    PermissionsModule,
    FileStorageModule,
  ],
  providers: [FileWorkflowService, FileWorkflowResolver],
  exports: [FileWorkflowService],
})
export class FileWorkflowModule {}
