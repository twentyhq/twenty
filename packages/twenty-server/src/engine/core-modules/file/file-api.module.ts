import { Module } from '@nestjs/common';

import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FileController } from 'src/engine/core-modules/file/controllers/file.controller';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { FileByIdGuard } from 'src/engine/core-modules/file/guards/file-by-id.guard';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { RecordExportModule } from 'src/engine/core-modules/record-export/record-export.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    CoreEntityCacheModule,
    FileModule,
    RecordExportModule,
    JwtModule,
    TokenModule,
    WorkspaceCacheStorageModule,
  ],
  controllers: [FileController],
  providers: [FileByIdGuard],
})
export class FileApiModule {}
