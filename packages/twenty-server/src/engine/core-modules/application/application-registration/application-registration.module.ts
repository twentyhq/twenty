import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationResolver } from 'src/engine/core-modules/application/application-registration/application-registration.resolver';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { OAuthDiscoveryController } from 'src/engine/core-modules/application/application-registration/controllers/oauth-discovery.controller';
import { OAuthTokenController } from 'src/engine/core-modules/application/application-registration/controllers/oauth-token.controller';
import { OAuthService } from 'src/engine/core-modules/application/application-registration/oauth.service';
import { ApplicationRegistrationVariableModule } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.module';
import { ApplicationPackageModule } from 'src/engine/core-modules/application/application-package/application-package.module';
import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationInstallModule } from 'src/engine/core-modules/application/application-install/application-install.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationRegistrationEntity,
      ApplicationEntity,
      AppTokenEntity,
      UserWorkspaceEntity,
    ]),
    ApplicationRegistrationVariableModule,
    FeatureFlagModule,
    PermissionsModule,
    ThrottlerModule,
    TokenModule,
    ApplicationModule,
    ApplicationInstallModule,
    ApplicationPackageModule,
    FileStorageModule,
    WorkspaceCacheStorageModule,
  ],
  controllers: [OAuthTokenController, OAuthDiscoveryController],
  providers: [
    ApplicationRegistrationService,
    ApplicationRegistrationResolver,
    OAuthService,
  ],
  exports: [
    ApplicationRegistrationService,
    ApplicationRegistrationVariableModule,
  ],
})
export class ApplicationRegistrationModule {}
