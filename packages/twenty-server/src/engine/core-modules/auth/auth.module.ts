/* eslint-disable no-restricted-imports */
import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { AppTokenService } from 'src/engine/core-modules/app-token/services/app-token.service';
import { GoogleAPIsAuthController } from 'src/engine/core-modules/auth/controllers/google-apis-auth.controller';
import { GoogleAuthController } from 'src/engine/core-modules/auth/controllers/google-auth.controller';
import { MicrosoftAuthController } from 'src/engine/core-modules/auth/controllers/microsoft-auth.controller';
import { VerifyAuthController } from 'src/engine/core-modules/auth/controllers/verify-auth.controller';
import { GoogleAPIsService } from 'src/engine/core-modules/auth/services/google-apis.service';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { TokenService } from 'src/engine/core-modules/auth/services/token.service';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { OnboardingModule } from 'src/engine/core-modules/onboarding/onboarding.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { User } from 'src/engine/core-modules/user/user.entity';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceManagerModule } from 'src/engine/workspace-manager/workspace-manager.module';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

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
      [Workspace, User, AppToken, FeatureFlagEntity],
      'core',
    ),
    ObjectMetadataRepositoryModule.forFeature([
      ConnectedAccountWorkspaceEntity,
      MessageChannelWorkspaceEntity,
    ]),
    HttpModule,
    UserWorkspaceModule,
    WorkspaceModule,
    OnboardingModule,
    TwentyORMModule.forFeature([CalendarChannelWorkspaceEntity]),
    WorkspaceDataSourceModule,
    ConnectedAccountModule,
  ],
  controllers: [
    GoogleAuthController,
    MicrosoftAuthController,
    GoogleAPIsAuthController,
    VerifyAuthController,
  ],
  providers: [
    SignInUpService,
    AuthService,
    TokenService,
    JwtAuthStrategy,
    AuthResolver,
    GoogleAPIsService,
    AppTokenService,
  ],
  exports: [TokenService],
})
export class AuthModule {}
