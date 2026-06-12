import { Module } from '@nestjs/common';

import { EmailingDomainModule } from 'src/engine/core-modules/emailing-domain/emailing-domain.module';
import { MessagingWebhooksController } from 'src/engine/core-modules/messaging-webhooks/messaging-webhooks.controller';
import { SesInboundMailHandlerService } from 'src/engine/core-modules/messaging-webhooks/services/ses-inbound-mail-handler.service';
import { SesInboundWebhookRouterService } from 'src/engine/core-modules/messaging-webhooks/services/ses-inbound-webhook-router.service';
import { SesOutboundSendingStateHandlerService } from 'src/engine/core-modules/messaging-webhooks/services/ses-outbound-sending-state-handler.service';
import { SesOutboundWebhookRouterService } from 'src/engine/core-modules/messaging-webhooks/services/ses-outbound-webhook-router.service';
import { SnsSignatureVerifierService } from 'src/engine/core-modules/messaging-webhooks/services/sns-signature-verifier.service';
import { SnsSubscriptionConfirmerService } from 'src/engine/core-modules/messaging-webhooks/services/sns-subscription-confirmer.service';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

@Module({
  imports: [TwentyConfigModule, EmailingDomainModule],
  controllers: [MessagingWebhooksController],
  providers: [
    SnsSignatureVerifierService,
    SnsSubscriptionConfirmerService,
    SesInboundMailHandlerService,
    SesOutboundSendingStateHandlerService,
    SesInboundWebhookRouterService,
    SesOutboundWebhookRouterService,
  ],
})
export class MessagingWebhooksModule {}
