import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationLogicFunctionEntity } from 'src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function.entity';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { LogicFunctionExecutorModule } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.module';
import { ServerLogicFunctionExecutorService } from 'src/engine/core-modules/server-logic-function-executor/server-logic-function-executor.service';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationRegistrationEntity,
      ApplicationRegistrationLogicFunctionEntity,
      ApplicationEntity,
      LogicFunctionEntity,
    ]),
    LogicFunctionExecutorModule,
    ThrottlerModule,
  ],
  providers: [ServerLogicFunctionExecutorService],
  exports: [ServerLogicFunctionExecutorService],
})
export class ServerLogicFunctionExecutorModule {}
