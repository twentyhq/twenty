import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { FileModule } from 'src/core/file/file.module';
import { WorkspaceManagerModule } from 'src/workspace/workspace-manager/workspace-manager.module';
import { WorkspaceResolver } from 'src/core/workspace/workspace.resolver';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FeatureFlagEntity } from 'src/core/feature-flag/feature-flag.entity';
import { UserModule } from 'src/core/user/user.module';
import { UserWorkspace } from 'src/core/user-workspace/user-workspace.entity';
import { User } from 'src/core/user/user.entity';

import { Workspace } from './workspace.entity';
import { workspaceAutoResolverOpts } from './workspace.auto-resolver-opts';

import { WorkspaceService } from './services/workspace.service';

@Module({
  imports: [
    TypeORMModule,
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature(
          [User, Workspace, UserWorkspace, FeatureFlagEntity],
          'core',
        ),
        WorkspaceManagerModule,
        UserModule,
        FileModule,
      ],
      services: [WorkspaceService],
      resolvers: workspaceAutoResolverOpts,
    }),
  ],
  exports: [WorkspaceService],
  providers: [WorkspaceResolver, WorkspaceService],
})
export class WorkspaceModule {}
