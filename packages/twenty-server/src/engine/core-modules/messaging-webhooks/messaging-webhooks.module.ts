import { Module } from '@nestjs/common';

import { MessagingWebhooksController } from 'src/engine/core-modules/messaging-webhooks/messaging-webhooks.controller';
import { MessagingWebhookDispatcherService } from 'src/engine/core-modules/messaging-webhooks/services/messaging-webhook-dispatcher.service';
import { SnsSignatureVerifierService } from 'src/engine/core-modules/messaging-webhooks/services/sns-signature-verifier.service';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

@Module({
  imports: [TwentyConfigModule],
  controllers: [MessagingWebhooksController],
  providers: [SnsSignatureVerifierService, MessagingWebhookDispatcherService],
})
export class MessagingWebhooksModule {}
