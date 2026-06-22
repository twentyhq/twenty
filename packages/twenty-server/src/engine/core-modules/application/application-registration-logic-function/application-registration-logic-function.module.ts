import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationLogicFunctionEntity } from 'src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function.entity';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationRegistrationLogicFunctionEntity,
      ApplicationRegistrationEntity,
    ]),
  ],
  providers: [],
  exports: [],
})
export class ApplicationRegistrationLogicFunctionModule {}
