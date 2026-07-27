import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationKeyValueResolver } from 'src/engine/core-modules/application/application-key-value/application-key-value.resolver';
import { ApplicationKeyValueService } from 'src/engine/core-modules/application/application-key-value/services/application-key-value.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KeyValuePairEntity,
      ApplicationEntity,
      ApplicationRegistrationEntity,
    ]),
  ],
  providers: [ApplicationKeyValueService, ApplicationKeyValueResolver],
  exports: [ApplicationKeyValueService],
})
export class ApplicationKeyValueModule {}
