/* eslint-disable no-restricted-imports */
import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { AppTokenService } from 'src/engine/core-modules/app-token/services/app-token.service';
import { GoogleAPIsAuthController } from 'src/engine/core-modules/auth/controllers/google-apis-auth.controller';
import { GoogleAuthController } from 'src/engine/core-modules/auth/controllers/google-auth.controller';
import { MicrosoftAPIsAuthController } from 'src/engine/core-modules/auth/controllers/microsoft-apis-auth.controller';
import { MicrosoftAuthController } from 'src/engine/core-modules/auth/controllers/microsoft-auth.controller';
import { SSOAuthController } from 'src/engine/core-modules/auth/controllers/sso-auth.controller';
import { VerifyAuthController } from 'src/engine/core-modules/auth/controllers/verify-auth.controller';
import { ApiKeyService } from 'src/engine/core-modules/auth/services/api-key.service';
import { GoogleAPIsService } from 'src/engine/core-modules/auth/services/google-apis.service';
import { MicrosoftAPIsService } from 'src/engine/core-modules/auth/services/microsoft-apis.service';
import { OAuthService } from 'src/engine/core-modules/auth/services/oauth.service';
import { ResetPasswordService } from 'src/engine/core-modules/auth/services/reset-password.service';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { SwitchWorkspaceService } from 'src/engine/core-modules/auth/services/switch-workspace.service';
import { SamlAuthStrategy } from 'src/engine/core-modules/auth/strategies/saml.auth.strategy';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { TransientTokenService } from 'src/engine/core-modules/auth/token/services/transient-token.service';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { OnboardingModule } from 'src/engine/core-modules/onboarding/onboarding.module';
import { WorkspaceSSOModule } from 'src/engine/core-modules/sso/sso.module';
import { WorkspaceSSOIdentityProvider } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { User } from 'src/engine/core-modules/user/user.entity';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { WorkspaceInvitationModule } from 'src/engine/core-modules/workspace-invitation/workspace-invitation.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceManagerModule } from 'src/engine/workspace-manager/workspace-manager.module';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';

import { AuthResolver } from './auth.resolver';

import { AuthService } from './services/auth.service';
import { JwtAuthStrategy } from './strategies/jwt.auth.strategy';

@Module({
  imports: [
    JwtModule,
    FileUploadModule,
    DataSourceModule,
    forwardRef(() => UserModule),
    WorkspaceManagerModule,
    TypeORMModule,
    TypeOrmModule.forFeature(
      [
        Workspace,
        User,
        AppToken,
        FeatureFlagEntity,
        WorkspaceSSOIdentityProvider,
        KeyValuePair,
      ],
      'core',
    ),
    HttpModule,
    TokenModule,
    UserWorkspaceModule,
    WorkspaceModule,
    OnboardingModule,
    WorkspaceDataSourceModule,
    WorkspaceInvitationModule,
    ConnectedAccountModule,
    WorkspaceSSOModule,
    FeatureFlagModule,
  ],
  controllers: [
    GoogleAuthController,
    MicrosoftAuthController,
    GoogleAPIsAuthController,
    MicrosoftAPIsAuthController,
    VerifyAuthController,
    SSOAuthController,
  ],
  providers: [
    SignInUpService,
    AuthService,
    JwtAuthStrategy,
    SamlAuthStrategy,
    AuthResolver,
    GoogleAPIsService,
    MicrosoftAPIsService,
    AppTokenService,
    AccessTokenService,
    LoginTokenService,
    ResetPasswordService,
    SwitchWorkspaceService,
    TransientTokenService,
    ApiKeyService,
    OAuthService,
  ],
  exports: [AccessTokenService, LoginTokenService],
})
export class AuthModule {}
