import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { WorkspaceQueryService } from './workspace-modifications.service';

import { JwtService } from '@nestjs/jwt';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { ApiKeyService } from 'src/engine/core-modules/auth/services/api-key.service';
import { TransientTokenService } from 'src/engine/core-modules/auth/token/services/transient-token.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { WorkspaceModificationsController } from './workspace-modifications.controller';

@Module({
  imports: [
    AuthModule,
    DataSourceModule,
    TypeORMModule,
    TypeOrmModule.forFeature([Workspace], 'core'),
    TypeOrmModule.forFeature([DataSourceEntity], 'metadata'),
  ],
  providers: [
    WorkspaceQueryService,
    EnvironmentService,
    JwtWrapperService,
    JwtService,
    WorkspaceCacheStorageService,
    ApiKeyService,
    TransientTokenService,
    WorkspaceDataSourceService,
  ],
  controllers: [WorkspaceModificationsController],

  exports: [WorkspaceQueryService]
})
export class WorkspaceModificationsModule {}