import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application-registration/application-registration-variable.entity';
import { ApplicationRegistrationEncryptionService } from 'src/engine/core-modules/application-registration/application-registration-encryption.service';
import { ApplicationRegistrationIdentifierGuardService } from 'src/engine/core-modules/application-registration/application-registration-identifier-guard.service';
import { ApplicationRegistrationVariableResolutionService } from 'src/engine/core-modules/application-registration/application-registration-variable-resolution.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application-registration/application-registration.entity';
import { ApplicationRegistrationResolver } from 'src/engine/core-modules/application-registration/application-registration.resolver';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application-registration/application-registration.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationVariableEntity } from 'src/engine/core-modules/applicationVariable/application-variable.entity';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationRegistrationEntity,
      ApplicationRegistrationVariableEntity,
      ApplicationEntity,
      ApplicationVariableEntity,
    ]),
    SecretEncryptionModule,
    PermissionsModule,
  ],
  providers: [
    ApplicationRegistrationService,
    ApplicationRegistrationEncryptionService,
    ApplicationRegistrationVariableResolutionService,
    ApplicationRegistrationIdentifierGuardService,
    ApplicationRegistrationResolver,
  ],
  exports: [
    ApplicationRegistrationService,
    ApplicationRegistrationEncryptionService,
    ApplicationRegistrationVariableResolutionService,
    ApplicationRegistrationIdentifierGuardService,
  ],
})
export class ApplicationRegistrationModule {}
