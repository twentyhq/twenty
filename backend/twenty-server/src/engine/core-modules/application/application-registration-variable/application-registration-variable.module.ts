import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationRegistrationVariableEntity,
      ApplicationRegistrationEntity,
    ]),
    SecretEncryptionModule,
  ],
  providers: [ApplicationRegistrationVariableService],
  exports: [ApplicationRegistrationVariableService],
})
export class ApplicationRegistrationVariableModule {}
