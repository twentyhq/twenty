import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileCorePictureService } from 'src/engine/core-modules/file/file-core-picture/file-core-picture.service';
import { FileCorePictureResolver } from 'src/engine/core-modules/file/file-core-picture/resolvers/file-core-picture.resolver';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([FileEntity, WorkspaceEntity, ApplicationEntity]),
    PermissionsModule,
    FileStorageModule,
    ApplicationModule,
    FileUrlModule,
  ],
  providers: [FileCorePictureService, FileCorePictureResolver],
  exports: [FileCorePictureService],
})
export class FileCorePictureModule {}
