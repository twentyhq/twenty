import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { ApplicationVariableEntity } from 'src/engine/core-modules/applicationVariable/application-variable.entity';
import { ApplicationVariableResolver } from 'src/engine/core-modules/applicationVariable/application-variable.resolver';
import { ApplicationVariableService } from 'src/engine/core-modules/applicationVariable/application-variable.service';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';

@Module({
  imports: [
    NestjsQueryTypeOrmModule.forFeature([ApplicationVariableEntity]),
    SecretEncryptionModule,
  ],
  providers: [ApplicationVariableService, ApplicationVariableResolver],
  exports: [ApplicationVariableService],
})
export class ApplicationVariableModule {}
