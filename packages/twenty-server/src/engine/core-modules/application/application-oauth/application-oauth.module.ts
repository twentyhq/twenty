import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { ApplicationInstallModule } from 'src/engine/core-modules/application/application-install/application-install.module';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationModule as ApplicationCoreModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationOAuthResolver } from 'src/engine/core-modules/application/application-oauth/application-oauth.resolver';
import { OAuthDiscoveryController } from 'src/engine/core-modules/application/application-oauth/controllers/oauth-discovery.controller';
import { OAuthTokenController } from 'src/engine/core-modules/application/application-oauth/controllers/oauth-token.controller';
import { OAuthService } from 'src/engine/core-modules/application/application-oauth/oauth.service';
import { ApplicationRegistrationModule } from 'src/engine/core-modules/application/application-registration/application-registration.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AppTokenEntity,
      ApplicationEntity,
      UserWorkspaceEntity,
    ]),
    ApplicationRegistrationModule,
    ApplicationCoreModule,
    ApplicationInstallModule,
    TokenModule,
    FeatureFlagModule,
    PermissionsModule,
    ThrottlerModule,
    TwentyConfigModule,
    WorkspaceCacheStorageModule,
  ],
  controllers: [OAuthTokenController, OAuthDiscoveryController],
  providers: [OAuthService, ApplicationOAuthResolver],
  exports: [OAuthService],
})
export class ApplicationOAuthModule {}
