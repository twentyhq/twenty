import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationRegistrationVariableEntity,
      ApplicationRegistrationEntity,
      ApplicationEntity,
    ]),
    CoreEntityCacheModule,
    SecretEncryptionModule,
  ],
  providers: [ApplicationRegistrationVariableService],
  exports: [ApplicationRegistrationVariableService],
})
export class ApplicationRegistrationVariableModule {}
