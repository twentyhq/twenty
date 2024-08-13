import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { OnboardingModule } from 'src/engine/core-modules/onboarding/onboarding.module';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { UserWorkspaceResolver } from 'src/engine/core-modules/user-workspace/user-workspace.resolver';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceWorkspaceMemberListener } from 'src/engine/core-modules/workspace/workspace-workspace-member.listener';
import { WorkspaceResolver } from 'src/engine/core-modules/workspace/workspace.resolver';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceCacheVersionModule } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.module';
import { WorkspaceManagerModule } from 'src/engine/workspace-manager/workspace-manager.module';

import { workspaceAutoResolverOpts } from './workspace.auto-resolver-opts';
import { Workspace } from './workspace.entity';

import { WorkspaceService } from './services/workspace.service';

@Module({
  imports: [
    TypeORMModule,
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        BillingModule,
        FileModule,
        FileUploadModule,
        WorkspaceCacheVersionModule,
        NestjsQueryTypeOrmModule.forFeature(
          [User, Workspace, UserWorkspace, FeatureFlagEntity],
          'core',
        ),
        UserWorkspaceModule,
        WorkspaceManagerModule,
        DataSourceModule,
        OnboardingModule,
        TypeORMModule,
      ],
      services: [WorkspaceService],
      resolvers: workspaceAutoResolverOpts,
    }),
  ],
  exports: [WorkspaceService],
  providers: [
    WorkspaceResolver,
    WorkspaceService,
    UserWorkspaceResolver,
    WorkspaceWorkspaceMemberListener,
  ],
})
export class WorkspaceModule {}
