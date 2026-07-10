import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { EmailVerificationModule } from 'src/engine/core-modules/email-verification/email-verification.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { OnboardingModule } from 'src/engine/core-modules/onboarding/onboarding.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { GlobalWorkspaceMemberListener } from 'src/engine/core-modules/user/services/global-workspace-member.listener';
import { UserEntityCacheProviderService } from 'src/engine/core-modules/user/services/user-entity-cache-provider.service';
import { WorkspaceFlatWorkspaceMemberMapCacheService } from 'src/engine/core-modules/user/services/workspace-flat-workspace-member-map-cache.service';
import { WorkspaceMemberTranspiler } from 'src/engine/core-modules/user/services/workspace-member-transpiler.service';
import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { UserResolver } from 'src/engine/core-modules/user/user.resolver';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { ConnectedAccountMetadataModule } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

import { UserService } from './services/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    TypeORMModule,
    FileModule,
    WorkspaceModule,
    OnboardingModule,
    TypeOrmModule.forFeature([KeyValuePairEntity, UserWorkspaceEntity]),
    UserVarsModule,
    UserWorkspaceModule,
    UserRoleModule,
    ConnectedAccountMetadataModule,
    FeatureFlagModule,
    PermissionsModule,
    EmailVerificationModule,
    WorkspaceDomainsModule,
    WorkspaceCacheModule,
    CoreEntityCacheModule,
  ],
  exports: [UserService, WorkspaceMemberTranspiler],
  providers: [
    UserService,
    UserResolver,
    UserEntityCacheProviderService,
    WorkspaceMemberTranspiler,
    WorkspaceFlatWorkspaceMemberMapCacheService,
    GlobalWorkspaceMemberListener,
  ],
})
export class UserModule {}
