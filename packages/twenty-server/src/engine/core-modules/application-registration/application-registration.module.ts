import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationEncryptionService } from 'src/engine/core-modules/application-registration/application-registration-encryption.service';
import { ApplicationRegistrationIdentifierValidationService } from 'src/engine/core-modules/application-registration/application-registration-identifier-validation.service';
import { ApplicationRegistrationVariableResolutionService } from 'src/engine/core-modules/application-registration/application-registration-variable-resolution.service';
import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application-registration/application-registration-variable.entity';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application-registration/application-registration-variable.service';
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
    ApplicationRegistrationVariableService,
    ApplicationRegistrationEncryptionService,
    ApplicationRegistrationVariableResolutionService,
    ApplicationRegistrationIdentifierValidationService,
    ApplicationRegistrationResolver,
  ],
  exports: [
    ApplicationRegistrationService,
    ApplicationRegistrationVariableService,
    ApplicationRegistrationEncryptionService,
    ApplicationRegistrationVariableResolutionService,
    ApplicationRegistrationIdentifierValidationService,
  ],
})
export class ApplicationRegistrationModule {}
