/* eslint-disable no-restricted-imports */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { AnalyticsModule } from 'src/engine/core-modules/analytics/analytics.module';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { OnboardingModule } from 'src/engine/core-modules/onboarding/onboarding.module';
import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { User } from 'src/engine/core-modules/user/user.entity';
import { UserResolver } from 'src/engine/core-modules/user/user.resolver';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';

import { userAutoResolverOpts } from './user.auto-resolver-opts';

import { UserService } from './services/user.service';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([User], 'core'),
        TypeORMModule,
        FileModule,
      ],
      resolvers: userAutoResolverOpts,
    }),
    NestjsQueryTypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
    DataSourceModule,
    FileUploadModule,
    WorkspaceModule,
    OnboardingModule,
    TypeOrmModule.forFeature([KeyValuePair], 'core'),
    UserVarsModule,
    AnalyticsModule,
    DomainManagerModule,
  ],
  exports: [UserService],
  providers: [UserService, UserResolver, TypeORMService],
})
export class UserModule {}
