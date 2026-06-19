import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationModule } from 'src/engine/core-modules/application/application-registration/application-registration.module';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationRegistrationWebhookController } from 'src/engine/core-modules/application-registration-webhook/application-registration-webhook.controller';
import { ApplicationRegistrationWebhookService } from 'src/engine/core-modules/application-registration-webhook/application-registration-webhook.service';
import { LogicFunctionExecutorModule } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.module';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogicFunctionEntity, ApplicationEntity]),
    ApplicationRegistrationModule,
    LogicFunctionExecutorModule,
  ],
  controllers: [ApplicationRegistrationWebhookController],
  providers: [ApplicationRegistrationWebhookService],
})
export class ApplicationRegistrationWebhookModule {}
