import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { OnboardingModule } from 'src/engine/core-modules/onboarding/onboarding.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { WorkspaceMemberTranspiler } from 'src/engine/core-modules/user/services/workspace-member-transpiler.service';
import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { UserResolver } from 'src/engine/core-modules/user/user.resolver';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { EmailVerificationModule } from 'src/engine/core-modules/email-verification/email-verification.module';

import { userAutoResolverOpts } from './user.auto-resolver-opts';

import { UserService } from './services/user.service';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([UserEntity]),
        TypeORMModule,
        FileModule,
      ],
      resolvers: userAutoResolverOpts,
    }),
    NestjsQueryTypeOrmModule.forFeature([ObjectMetadataEntity]),
    DataSourceModule,
    FileUploadModule,
    WorkspaceModule,
    OnboardingModule,
    TypeOrmModule.forFeature([KeyValuePairEntity, UserWorkspaceEntity]),
    UserVarsModule,
    UserWorkspaceModule,
    AuditModule,
    UserRoleModule,
    FeatureFlagModule,
    PermissionsModule,
    EmailVerificationModule,
    WorkspaceDomainsModule,
  ],
  exports: [UserService, WorkspaceMemberTranspiler],
  providers: [UserService, UserResolver, WorkspaceMemberTranspiler],
})
export class UserModule {}
