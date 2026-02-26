import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppRegistrationVariableEntity } from 'src/engine/core-modules/app-registration/app-registration-variable.entity';
import { AppRegistrationEncryptionService } from 'src/engine/core-modules/app-registration/app-registration-encryption.service';
import { AppRegistrationIdentifierGuardService } from 'src/engine/core-modules/app-registration/app-registration-identifier-guard.service';
import { AppRegistrationVariableResolutionService } from 'src/engine/core-modules/app-registration/app-registration-variable-resolution.service';
import { AppRegistrationEntity } from 'src/engine/core-modules/app-registration/app-registration.entity';
import { AppRegistrationResolver } from 'src/engine/core-modules/app-registration/app-registration.resolver';
import { AppRegistrationService } from 'src/engine/core-modules/app-registration/app-registration.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationVariableEntity } from 'src/engine/core-modules/applicationVariable/application-variable.entity';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AppRegistrationEntity,
      AppRegistrationVariableEntity,
      ApplicationEntity,
      ApplicationVariableEntity,
    ]),
    SecretEncryptionModule,
    PermissionsModule,
  ],
  providers: [
    AppRegistrationService,
    AppRegistrationEncryptionService,
    AppRegistrationVariableResolutionService,
    AppRegistrationIdentifierGuardService,
    AppRegistrationResolver,
  ],
  exports: [
    AppRegistrationService,
    AppRegistrationEncryptionService,
    AppRegistrationVariableResolutionService,
    AppRegistrationIdentifierGuardService,
  ],
})
export class AppRegistrationModule {}
