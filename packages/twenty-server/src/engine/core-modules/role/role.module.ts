/* eslint-disable no-restricted-imports */
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { OnboardingModule } from 'src/engine/core-modules/onboarding/onboarding.module';
import { RoleResolver } from 'src/engine/core-modules/role/role.resolver';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';

import { Permission } from 'src/engine/core-modules/permission/permission.entity';
import { Role } from 'src/engine/core-modules/role/role.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { RoleService } from './services/role.service';


@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([Role, Permission, User, Workspace], 'core'),
        TypeORMModule,
        FileModule,
      ],
    }),
    DataSourceModule,
    FileUploadModule,
    forwardRef(() => WorkspaceModule),
    OnboardingModule,
    TypeOrmModule.forFeature([KeyValuePair], 'core'),
  ],
  exports: [RoleService],
  providers: [RoleService, RoleResolver, TypeORMService],
})
export class RoleModule {}
