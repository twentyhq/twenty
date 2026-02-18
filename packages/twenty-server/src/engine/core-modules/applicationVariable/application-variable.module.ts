import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { ApplicationVariableEntity } from 'src/engine/core-modules/applicationVariable/application-variable.entity';
import { ApplicationVariableEntityResolver } from 'src/engine/core-modules/applicationVariable/application-variable.resolver';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/applicationVariable/application-variable.service';
import { WorkspaceApplicationVariableMapCacheService } from 'src/engine/core-modules/applicationVariable/services/workspace-application-variable-map-cache.service';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    NestjsQueryTypeOrmModule.forFeature([ApplicationVariableEntity]),
    TypeOrmModule.forFeature([ApplicationVariableEntity]),
    PermissionsModule,
    WorkspaceCacheModule,
    SecretEncryptionModule,
  ],
  providers: [
    ApplicationVariableEntityService,
    ApplicationVariableEntityResolver,
    WorkspaceApplicationVariableMapCacheService,
  ],
  exports: [
    ApplicationVariableEntityService,
    WorkspaceApplicationVariableMapCacheService,
  ],
})
export class ApplicationVariableEntityModule {}
