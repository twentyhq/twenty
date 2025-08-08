import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { OnboardingModule } from 'src/engine/core-modules/onboarding/onboarding.module';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceWorkspaceMemberListener } from 'src/engine/core-modules/workspace/workspace-workspace-member.listener';
import { WorkspaceResolver } from 'src/engine/core-modules/workspace/workspace.resolver';
import { AgentModule } from 'src/engine/metadata-modules/agent/agent.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceManagerModule } from 'src/engine/workspace-manager/workspace-manager.module';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';

import { workspaceAutoResolverOpts } from './workspace.auto-resolver-opts';
import { Workspace } from './workspace.entity';

import { WorkspaceService } from './services/workspace.service';

@Module({
  imports: [
    TypeORMModule,
    TypeOrmModule.forFeature([BillingSubscription], 'core'),
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        BillingModule,
        FileModule,
        TokenModule,
        FileUploadModule,
        WorkspaceMetadataCacheModule,
        NestjsQueryTypeOrmModule.forFeature(
          [User, Workspace, UserWorkspace],
          'core',
        ),
        UserWorkspaceModule,
        WorkspaceManagerModule,
        FeatureFlagModule,
        DataSourceModule,
        OnboardingModule,
        TypeORMModule,
        PermissionsModule,
        WorkspaceCacheStorageModule,
        RoleModule,
        AgentModule,
        DomainManagerModule,
      ],
      services: [WorkspaceService],
      resolvers: workspaceAutoResolverOpts,
    }),
  ],
  exports: [WorkspaceService],
  providers: [
    WorkspaceResolver,
    WorkspaceService,
    WorkspaceWorkspaceMemberListener,
  ],
})
export class WorkspaceModule {}
