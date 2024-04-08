/* eslint-disable no-restricted-imports */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { WorkspaceManagerModule } from 'src/engine/workspace-manager/workspace-manager.module';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { GoogleAuthController } from 'src/engine/core-modules/auth/controllers/google-auth.controller';
import { GoogleAPIsAuthController } from 'src/engine/core-modules/auth/controllers/google-apis-auth.controller';
import { VerifyAuthController } from 'src/engine/core-modules/auth/controllers/verify-auth.controller';
import { TokenService } from 'src/engine/core-modules/auth/services/token.service';
import { GoogleAPIsService } from 'src/engine/core-modules/auth/services/google-apis.service';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { SignUpService } from 'src/engine/core-modules/auth/services/sign-up.service';
import { GoogleGmailAuthController } from 'src/engine/core-modules/auth/controllers/google-gmail-auth.controller';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { AppTokenService } from 'src/engine/core-modules/app-token/services/app-token.service';

import { AuthResolver } from './auth.resolver';

import { JwtAuthStrategy } from './strategies/jwt.auth.strategy';
import { AuthService } from './services/auth.service';
const jwtModule = JwtModule.registerAsync({
  useFactory: async (environmentService: EnvironmentService) => {
    return {
      secret: environmentService.get('ACCESS_TOKEN_SECRET'),
      signOptions: {
        expiresIn: environmentService.get('ACCESS_TOKEN_EXPIRES_IN'),
      },
    };
  },
  inject: [EnvironmentService],
});

@Module({
  imports: [
    jwtModule,
    FileUploadModule,
    DataSourceModule,
    UserModule,
    WorkspaceManagerModule,
    TypeORMModule,
    TypeOrmModule.forFeature(
      [Workspace, User, AppToken, FeatureFlagEntity],
      'core',
    ),
    HttpModule,
    UserWorkspaceModule,
  ],
  controllers: [
    GoogleAuthController,
    GoogleAPIsAuthController,
    GoogleGmailAuthController,
    VerifyAuthController,
  ],
  providers: [
    SignUpService,
    AuthService,
    TokenService,
    JwtAuthStrategy,
    AuthResolver,
    GoogleAPIsService,
    AppTokenService,
  ],
  exports: [jwtModule, TokenService],
})
export class AuthModule {}
