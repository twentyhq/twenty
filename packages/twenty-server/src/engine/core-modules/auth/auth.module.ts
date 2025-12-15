/* eslint-disable no-restricted-imports */
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { AppTokenService } from 'src/engine/core-modules/app-token/services/app-token.service';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { GoogleAPIsAuthController } from 'src/engine/core-modules/auth/controllers/google-apis-auth.controller';
import { GoogleAuthController } from 'src/engine/core-modules/auth/controllers/google-auth.controller';
import { MicrosoftAPIsAuthController } from 'src/engine/core-modules/auth/controllers/microsoft-apis-auth.controller';
import { MicrosoftAuthController } from 'src/engine/core-modules/auth/controllers/microsoft-auth.controller';
import { SSOAuthController } from 'src/engine/core-modules/auth/controllers/sso-auth.controller';
import { AuthSsoService } from 'src/engine/core-modules/auth/services/auth-sso.service';
import { CreateCalendarChannelService } from 'src/engine/core-modules/auth/services/create-calendar-channel.service';
import { CreateConnectedAccountService } from 'src/engine/core-modules/auth/services/create-connected-account.service';
import { CreateMessageChannelService } from 'src/engine/core-modules/auth/services/create-message-channel.service';
import { GoogleAPIScopesService } from 'src/engine/core-modules/auth/services/google-apis-scopes';
import { GoogleAPIsService } from 'src/engine/core-modules/auth/services/google-apis.service';
import { MicrosoftAPIsService } from 'src/engine/core-modules/auth/services/microsoft-apis.service';
import { ResetPasswordService } from 'src/engine/core-modules/auth/services/reset-password.service';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { UpdateConnectedAccountOnReconnectService } from 'src/engine/core-modules/auth/services/update-connected-account-on-reconnect.service';
import { SamlAuthStrategy } from 'src/engine/core-modules/auth/strategies/saml.auth.strategy';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { TransientTokenService } from 'src/engine/core-modules/auth/token/services/transient-token.service';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { DomainServerConfigModule } from 'src/engine/core-modules/domain/domain-server-config/domain-server-config.module';
import { SubdomainManagerModule } from 'src/engine/core-modules/domain/subdomain-manager/subdomain-manager.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { EmailVerificationModule } from 'src/engine/core-modules/email-verification/email-verification.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { GuardRedirectModule } from 'src/engine/core-modules/guard-redirect/guard-redirect.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { OnboardingModule } from 'src/engine/core-modules/onboarding/onboarding.module';
import { WorkspaceSSOModule } from 'src/engine/core-modules/sso/sso.module';
import { WorkspaceSSOIdentityProviderEntity } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { WorkspaceInvitationModule } from 'src/engine/core-modules/workspace-invitation/workspace-invitation.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceManagerModule } from 'src/engine/workspace-manager/workspace-manager.module';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { MessagingFolderSyncManagerModule } from 'src/modules/messaging/message-folder-manager/messaging-folder-sync-manager.module';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

import { TwoFactorAuthenticationMethodEntity } from '../two-factor-authentication/entities/two-factor-authentication-method.entity';
import { TwoFactorAuthenticationModule } from '../two-factor-authentication/two-factor-authentication.module';

import { AuthResolver } from './auth.resolver';

import { AuthService } from './services/auth.service';
import { JwtAuthStrategy } from './strategies/jwt.auth.strategy';

@Module({
  imports: [
    JwtModule,
    FileUploadModule,
    DataSourceModule,
    WorkspaceDomainsModule,
    TokenModule,
    UserModule,
    WorkspaceManagerModule,
    TypeORMModule,
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      UserEntity,
      AppTokenEntity,
      ApiKeyEntity,
      ApplicationEntity,
      FeatureFlagEntity,
      WorkspaceSSOIdentityProviderEntity,
      KeyValuePairEntity,
      UserWorkspaceEntity,
      TwoFactorAuthenticationMethodEntity,
      ObjectMetadataEntity,
    ]),
    HttpModule,
    UserWorkspaceModule,
    WorkspaceModule,
    OnboardingModule,
    WorkspaceDataSourceModule,
    ConnectedAccountModule,
    MessagingFolderSyncManagerModule,
    WorkspaceSSOModule,
    FeatureFlagModule,
    WorkspaceInvitationModule,
    EmailVerificationModule,
    GuardRedirectModule,
    MetricsModule,
    PermissionsModule,
    UserRoleModule,
    TwoFactorAuthenticationModule,
    ApiKeyModule,
    AuditModule,
    SubdomainManagerModule,
    DomainServerConfigModule,
    ApplicationModule,
    WorkspaceCacheModule,
  ],
  controllers: [
    GoogleAuthController,
    MicrosoftAuthController,
    GoogleAPIsAuthController,
    MicrosoftAPIsAuthController,
    SSOAuthController,
  ],
  providers: [
    SignInUpService,
    AuthService,
    JwtAuthStrategy,
    SamlAuthStrategy,
    AuthResolver,
    GoogleAPIsService,
    GoogleAPIScopesService,
    MicrosoftAPIsService,
    AppTokenService,
    AccessTokenService,
    RefreshTokenService,
    LoginTokenService,
    ResetPasswordService,
    // So far, it's not possible to have controllers in business modules
    // which forces us to have these services in the auth module
    // TODO: Move these calendar, message, and connected account services to the business modules once possible
    MessageChannelSyncStatusService,
    CalendarChannelSyncStatusService,
    CreateMessageChannelService,
    CreateCalendarChannelService,
    CreateConnectedAccountService,
    UpdateConnectedAccountOnReconnectService,
    TransientTokenService,
    AuthSsoService,
  ],
  exports: [
    AccessTokenService,
    LoginTokenService,
    RefreshTokenService,
    CreateMessageChannelService,
    CreateCalendarChannelService,
  ],
})
export class AuthModule {}
