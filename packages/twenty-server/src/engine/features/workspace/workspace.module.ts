import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { FileModule } from 'src/engine/features/file/file.module';
import { WorkspaceManagerModule } from 'src/engine/workspace/manager/workspace-manager.module';
import { WorkspaceResolver } from 'src/engine/features/workspace/workspace.resolver';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FeatureFlagEntity } from 'src/engine/features/feature-flag/feature-flag.entity';
import { UserWorkspace } from 'src/engine/features/user-workspace/user-workspace.entity';
import { User } from 'src/engine/features/user/user.entity';
import { UserWorkspaceModule } from 'src/engine/features/user-workspace/user-workspace.module';
import { BillingModule } from 'src/engine/features/billing/billing.module';

import { Workspace } from './workspace.entity';
import { workspaceAutoResolverOpts } from './workspace.auto-resolver-opts';

import { WorkspaceService } from './services/workspace.service';

@Module({
  imports: [
    TypeORMModule,
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        BillingModule,
        FileModule,
        NestjsQueryTypeOrmModule.forFeature(
          [User, Workspace, UserWorkspace, FeatureFlagEntity],
          'core',
        ),
        UserWorkspaceModule,
        WorkspaceManagerModule,
      ],
      services: [WorkspaceService],
      resolvers: workspaceAutoResolverOpts,
    }),
  ],
  exports: [WorkspaceService],
  providers: [WorkspaceResolver, WorkspaceService],
})
export class WorkspaceModule {}
