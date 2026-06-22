import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationLogicFunctionEntity } from 'src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function.entity';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { LogicFunctionExecutorModule } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.module';
import { ServerCronTriggerCronCommand } from 'src/engine/core-modules/server-logic-function-executor/cron/server-cron-trigger.cron.command';
import { ServerCronTriggerCronJob } from 'src/engine/core-modules/server-logic-function-executor/cron/server-cron-trigger.cron.job';
import { ServerLogicFunctionExecutionJob } from 'src/engine/core-modules/server-logic-function-executor/cron/server-logic-function-execution.job';
import { ServerLogicFunctionExecutorService } from 'src/engine/core-modules/server-logic-function-executor/server-logic-function-executor.service';
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
  ],
  providers: [
    ServerLogicFunctionExecutorService,
    ServerCronTriggerCronJob,
    ServerLogicFunctionExecutionJob,
    ServerCronTriggerCronCommand,
  ],
  exports: [ServerLogicFunctionExecutorService, ServerCronTriggerCronCommand],
})
export class ServerLogicFunctionExecutorModule {}
