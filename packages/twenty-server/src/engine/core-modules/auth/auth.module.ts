/* eslint-disable no-restricted-imports */
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { AppTokenService } from 'src/engine/core-modules/app-token/services/app-token.service';
import { GoogleAPIsAuthController } from 'src/engine/core-modules/auth/controllers/google-apis-auth.controller';
import { GoogleAuthController } from 'src/engine/core-modules/auth/controllers/google-auth.controller';
import { MicrosoftAPIsAuthController } from 'src/engine/core-modules/auth/controllers/microsoft-apis-auth.controller';
import { MicrosoftAuthController } from 'src/engine/core-modules/auth/controllers/microsoft-auth.controller';
import { SSOAuthController } from 'src/engine/core-modules/auth/controllers/sso-auth.controller';
import { AuthSsoService } from 'src/engine/core-modules/auth/services/auth-sso.service';
import { CreateCalendarChannelService } from 'src/engine/core-modules/auth/services/create-calendar-channel.service';
import { CreateConnectedAccountService } from 'src/engine/core-modules/auth/services/create-connected-account.service';
import { CreateMessageChannelService } from 'src/engine/core-modules/auth/services/create-message-channel.service';
import { CreateMessageFolderService } from 'src/engine/core-modules/auth/services/create-message-folder.service';
import { GoogleAPIScopesService } from 'src/engine/core-modules/auth/services/google-apis-scopes';
import { GoogleAPIsService } from 'src/engine/core-modules/auth/services/google-apis.service';
import { MicrosoftAPIsService } from 'src/engine/core-modules/auth/services/microsoft-apis.service';
import { ResetCalendarChannelService } from 'src/engine/core-modules/auth/services/reset-calendar-channel.service';
import { ResetMessageChannelService } from 'src/engine/core-modules/auth/services/reset-message-channel.service';
import { ResetMessageFolderService } from 'src/engine/core-modules/auth/services/reset-message-folder.service';
import { ResetPasswordService } from 'src/engine/core-modules/auth/services/reset-password.service';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { UpdateConnectedAccountOnReconnectService } from 'src/engine/core-modules/auth/services/update-connected-account-on-reconnect.service';
import { SamlAuthStrategy } from 'src/engine/core-modules/auth/strategies/saml.auth.strategy';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { TransientTokenService } from 'src/engine/core-modules/auth/token/services/transient-token.service';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { EmailVerificationModule } from 'src/engine/core-modules/email-verification/email-verification.module';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { GuardRedirectModule } from 'src/engine/core-modules/guard-redirect/guard-redirect.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { OnboardingModule } from 'src/engine/core-modules/onboarding/onboarding.module';
import { WorkspaceSSOModule } from 'src/engine/core-modules/sso/sso.module';
import { WorkspaceSSOIdentityProvider } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { User } from 'src/engine/core-modules/user/user.entity';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { WorkspaceInvitationModule } from 'src/engine/core-modules/workspace-invitation/workspace-invitation.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceManagerModule } from 'src/engine/workspace-manager/workspace-manager.module';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';

import { TwoFactorAuthenticationMethod } from '../two-factor-authentication/entities/two-factor-authentication-method.entity';
import { TwoFactorAuthenticationModule } from '../two-factor-authentication/two-factor-authentication.module';

import { AuthResolver } from './auth.resolver';

import { AuthService } from './services/auth.service';
import { JwtAuthStrategy } from './strategies/jwt.auth.strategy';

@Module({
  imports: [
    JwtModule,
    FileUploadModule,
    DataSourceModule,
    DomainManagerModule,
    TokenModule,
    UserModule,
    WorkspaceManagerModule,
    TypeORMModule,
    TypeOrmModule.forFeature(
      [
        Workspace,
        User,
        AppToken,
        ApiKey,
        FeatureFlag,
        WorkspaceSSOIdentityProvider,
        KeyValuePair,
        UserWorkspace,
        TwoFactorAuthenticationMethod,
      ],
      'core',
    ),
    TypeOrmModule.forFeature([ObjectMetadataEntity], 'core'),
    HttpModule,
    UserWorkspaceModule,
    WorkspaceModule,
    OnboardingModule,
    WorkspaceDataSourceModule,
    ConnectedAccountModule,
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
    ResetMessageChannelService,
    ResetCalendarChannelService,
    ResetMessageFolderService,
    CreateMessageChannelService,
    CreateCalendarChannelService,
    CreateMessageFolderService,
    CreateConnectedAccountService,
    UpdateConnectedAccountOnReconnectService,
    TransientTokenService,
    AuthSsoService,
  ],
  exports: [
    AccessTokenService,
    LoginTokenService,
    RefreshTokenService,
    CreateMessageFolderService,
  ],
})
export class AuthModule {}
