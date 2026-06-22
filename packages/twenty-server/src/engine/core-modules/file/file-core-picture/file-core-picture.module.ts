import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileCorePictureResolver } from 'src/engine/core-modules/file/file-core-picture/resolvers/file-core-picture.resolver';
import { FileCorePictureService } from 'src/engine/core-modules/file/file-core-picture/services/file-core-picture.service';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([
      FileEntity,
      WorkspaceEntity,
      UserWorkspaceEntity,
    ]),
    PermissionsModule,
    FileStorageModule,
    FileUrlModule,
    SecureHttpClientModule,
  ],
  providers: [
    FileCorePictureService,
    FileCorePictureResolver,
    provideWorkspaceScopedRepository(FileEntity),
  ],
  exports: [FileCorePictureService],
})
export class FileCorePictureModule {}
