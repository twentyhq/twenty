import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { TwoFactorMethod } from 'src/engine/core-modules/two-factor-method/two-factor-method.entity';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceResolver } from 'src/engine/core-modules/user-workspace/user-workspace.resolver';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationModule } from 'src/engine/core-modules/workspace-invitation/workspace-invitation.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature(
          [User, UserWorkspace, Workspace, TwoFactorMethod],
          'core',
        ),
        NestjsQueryTypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
        TypeORMModule,
        DataSourceModule,
        WorkspaceDataSourceModule,
        WorkspaceInvitationModule,
        DomainManagerModule,
        TwentyORMModule,
      ],
      services: [UserWorkspaceService],
    }),
  ],
  exports: [UserWorkspaceService],
  providers: [UserWorkspaceService, UserWorkspaceResolver],
})
export class UserWorkspaceModule {}
