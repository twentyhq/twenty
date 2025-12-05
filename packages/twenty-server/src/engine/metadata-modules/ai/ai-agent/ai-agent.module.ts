import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { AiAgentRoleModule } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.module';
import { AgentGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/ai-agent/interceptors/agent-graphql-api-exception.interceptor';
import { AiModelsModule } from 'src/engine/metadata-modules/ai/ai-models/ai-models.module';
import { FlatAgentModule } from 'src/engine/metadata-modules/flat-agent/flat-agent.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationBuilderGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/workspace-migration-builder-graphql-api-exception.interceptor';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

import { AgentResolver } from './agent.resolver';
import { AgentService } from './agent.service';

import { AgentEntity } from './entities/agent.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentEntity, RoleEntity, RoleTargetEntity]),
    AiModelsModule,
    AiAgentRoleModule,
    ThrottlerModule,
    AuditModule,
    FeatureFlagModule,
    FileUploadModule,
    FileModule,
    ObjectMetadataModule,
    PermissionsModule,
    WorkspaceCacheStorageModule,
    WorkspaceMigrationV2Module,
    ApplicationModule,
    FlatAgentModule,
    WorkspaceCacheModule,
  ],
  providers: [
    AgentResolver,
    AgentService,
    WorkspaceMigrationBuilderGraphqlApiExceptionInterceptor,
    AgentGraphqlApiExceptionInterceptor,
  ],
  exports: [AgentService, TypeOrmModule.forFeature([AgentEntity])],
})
export class AiAgentModule {}
