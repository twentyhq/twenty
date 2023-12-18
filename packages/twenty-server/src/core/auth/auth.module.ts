/* eslint-disable no-restricted-imports */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { FileModule } from 'src/core/file/file.module';
import { Workspace } from 'src/core/workspace/workspace.entity';
import { User } from 'src/core/user/user.entity';
import { RefreshToken } from 'src/core/refresh-token/refresh-token.entity';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { UserModule } from 'src/core/user/user.module';
import { WorkspaceManagerModule } from 'src/workspace/workspace-manager/workspace-manager.module';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { GoogleAuthController } from 'src/core/auth/controllers/google-auth.controller';
import { GoogleGmailAuthController } from 'src/core/auth/controllers/google-gmail-auth.controller';
import { VerifyAuthController } from 'src/core/auth/controllers/verify-auth.controller';
import { TokenService } from 'src/core/auth/services/token.service';
import { GoogleGmailService } from 'src/core/auth/services/google-gmail.service';

import { AuthResolver } from './auth.resolver';

import { JwtAuthStrategy } from './strategies/jwt.auth.strategy';
import { AuthService } from './services/auth.service';
const jwtModule = JwtModule.registerAsync({
  useFactory: async (environmentService: EnvironmentService) => {
    return {
      secret: environmentService.getAccessTokenSecret(),
      signOptions: {
        expiresIn: environmentService.getAccessTokenExpiresIn(),
      },
    };
  },
  inject: [EnvironmentService],
});

@Module({
  imports: [
    jwtModule,
    FileModule,
    DataSourceModule,
    UserModule,
    WorkspaceManagerModule,
    TypeORMModule,
    TypeOrmModule.forFeature([Workspace, User, RefreshToken], 'core'),
    HttpModule,
  ],
  controllers: [
    GoogleAuthController,
    GoogleGmailAuthController,
    VerifyAuthController,
  ],
  providers: [
    AuthService,
    TokenService,
    JwtAuthStrategy,
    AuthResolver,
    GoogleGmailService,
  ],
  exports: [jwtModule, TokenService],
})
export class AuthModule {}
