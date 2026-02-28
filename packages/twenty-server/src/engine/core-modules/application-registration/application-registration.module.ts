import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application-registration/application-registration-variable.entity';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application-registration/application-registration-variable.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application-registration/application-registration.entity';
import { ApplicationRegistrationResolver } from 'src/engine/core-modules/application-registration/application-registration.resolver';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application-registration/application-registration.service';
import { OAuthDiscoveryController } from 'src/engine/core-modules/application-registration/controllers/oauth-discovery.controller';
import { OAuthTokenController } from 'src/engine/core-modules/application-registration/controllers/oauth-token.controller';
import { OAuthService } from 'src/engine/core-modules/application-registration/oauth.service';
import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationRegistrationEntity,
      ApplicationRegistrationVariableEntity,
      ApplicationEntity,
      AppTokenEntity,
      UserWorkspaceEntity,
    ]),
    SecretEncryptionModule,
    PermissionsModule,
    TokenModule,
    ApplicationModule,
  ],
  controllers: [OAuthTokenController, OAuthDiscoveryController],
  providers: [
    ApplicationRegistrationService,
    ApplicationRegistrationVariableService,
    ApplicationRegistrationResolver,
    OAuthService,
  ],
  exports: [
    ApplicationRegistrationService,
    ApplicationRegistrationVariableService,
  ],
})
export class ApplicationRegistrationModule {}
