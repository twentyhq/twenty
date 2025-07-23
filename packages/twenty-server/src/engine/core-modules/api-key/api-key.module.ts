import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApiKeyResolver } from 'src/engine/core-modules/api-key/api-key.resolver';
import { ApiKeyService } from 'src/engine/core-modules/api-key/api-key.service';
import { ApiKeyMetadataController } from 'src/engine/core-modules/api-key/controllers/api-key-metadata.controller';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

import { ApiKeyController } from './controllers/api-key.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiKey], 'core'),
    JwtModule,
    AuthModule,
    WorkspaceCacheStorageModule,
  ],
  providers: [ApiKeyService, ApiKeyResolver],
  controllers: [ApiKeyController, ApiKeyMetadataController],
  exports: [ApiKeyService, TypeOrmModule],
})
export class ApiKeyModule {}
