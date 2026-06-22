import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationLogicFunctionEntity } from 'src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function.entity';
import { ApplicationRegistrationLogicFunctionService } from 'src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function.service';
import { ApplicationRegistrationLogicFunctionSyncService } from 'src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function-sync.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationRegistrationLogicFunctionEntity,
      ApplicationRegistrationEntity,
    ]),
  ],
  providers: [
    ApplicationRegistrationLogicFunctionSyncService,
    ApplicationRegistrationLogicFunctionService,
  ],
  exports: [
    ApplicationRegistrationLogicFunctionSyncService,
    ApplicationRegistrationLogicFunctionService,
  ],
})
export class ApplicationRegistrationLogicFunctionModule {}
