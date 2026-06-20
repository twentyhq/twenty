import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationModule } from 'src/engine/core-modules/application/application-registration/application-registration.module';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ServerWebhookTriggerController } from 'src/engine/core-modules/server-webhook-trigger/server-webhook-trigger.controller';
import { ServerWebhookTriggerService } from 'src/engine/core-modules/server-webhook-trigger/server-webhook-trigger.service';
import { LogicFunctionTriggerModule } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-trigger.module';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogicFunctionEntity, ApplicationEntity]),
    ApplicationRegistrationModule,
    LogicFunctionTriggerModule,
  ],
  controllers: [ServerWebhookTriggerController],
  providers: [ServerWebhookTriggerService],
})
export class ServerWebhookTriggerModule {}
