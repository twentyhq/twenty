/* eslint-disable no-restricted-imports */
import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { User } from 'src/engine/core-modules/user/user.entity';
import { UserResolver } from 'src/engine/core-modules/user/resolvers/user.resolver';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { UserStateService } from 'src/engine/core-modules/user/services/user-state.service';
import { UserStateResolver } from 'src/engine/core-modules/user/resolvers/user-state.resolver';
import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';

import { userAutoResolverOpts } from './user.auto-resolver-opts';

import { UserService } from './services/user.service';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([User, KeyValuePair], 'core'),
        TypeORMModule,
      ],
      resolvers: userAutoResolverOpts,
    }),
    DataSourceModule,
    FileUploadModule,
    WorkspaceModule,
  ],
  exports: [UserService, UserStateService],
  providers: [
    UserService,
    UserResolver,
    UserStateService,
    UserStateResolver,
    TypeORMService,
  ],
})
export class UserModule {}
