/* eslint-disable no-restricted-imports */
import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { User } from 'src/engine/core-modules/user/user.entity';
import { UserResolver } from 'src/engine/core-modules/user/user.resolver';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';

import { userAutoResolverOpts } from './user.auto-resolver-opts';

import { UserService } from './services/user.service';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([User, UserWorkspace], 'core'),
        TypeORMModule,
      ],
      resolvers: userAutoResolverOpts,
    }),
    DataSourceModule,
    FileUploadModule,
    UserWorkspaceModule,
  ],
  exports: [UserService],
  providers: [UserService, UserResolver, TypeORMService],
})
export class UserModule {}
