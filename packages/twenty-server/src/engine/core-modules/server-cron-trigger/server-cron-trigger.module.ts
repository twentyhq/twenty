import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServerCronTriggerCronCommand } from 'src/engine/core-modules/server-cron-trigger/server-cron-trigger.cron.command';
import { ServerCronTriggerCronJob } from 'src/engine/core-modules/server-cron-trigger/server-cron-trigger.cron.job';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LogicFunctionEntity])],
  providers: [ServerCronTriggerCronJob, ServerCronTriggerCronCommand],
  exports: [ServerCronTriggerCronCommand],
})
export class ServerCronTriggerModule {}
