import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InboundWebhookRenewalCronCommand } from 'src/engine/core-modules/inbound-webhook/crons/commands/inbound-webhook-renewal.cron.command';
import { InboundWebhookRenewalCronJob } from 'src/engine/core-modules/inbound-webhook/crons/jobs/inbound-webhook-renewal.cron.job';
import { InboundWebhookController } from 'src/engine/core-modules/inbound-webhook/controllers/inbound-webhook.controller';
import { InboundWebhookSubscriptionEntity } from 'src/engine/core-modules/inbound-webhook/entities/inbound-webhook-subscription.entity';
import { GoogleCalendarInboundWebhookHandler } from 'src/engine/core-modules/inbound-webhook/handlers/google-calendar-inbound-webhook.handler';
import { GoogleMessagingInboundWebhookHandler } from 'src/engine/core-modules/inbound-webhook/handlers/google-messaging-inbound-webhook.handler';
import { InboundEmailSesInboundWebhookHandler } from 'src/engine/core-modules/inbound-webhook/handlers/inbound-email-ses-inbound-webhook.handler';
import { MicrosoftCalendarInboundWebhookHandler } from 'src/engine/core-modules/inbound-webhook/handlers/microsoft-calendar-inbound-webhook.handler';
import { MicrosoftMessagingInboundWebhookHandler } from 'src/engine/core-modules/inbound-webhook/handlers/microsoft-messaging-inbound-webhook.handler';
import { ProcessInboundWebhookJob } from 'src/engine/core-modules/inbound-webhook/jobs/process-inbound-webhook.job';
import { InboundWebhookDispatcherService } from 'src/engine/core-modules/inbound-webhook/services/inbound-webhook-dispatcher.service';
import { InboundWebhookIdempotencyService } from 'src/engine/core-modules/inbound-webhook/services/inbound-webhook-idempotency.service';
import { InboundWebhookSubscriptionService } from 'src/engine/core-modules/inbound-webhook/services/inbound-webhook-subscription.service';
import { InboundWebhookVerifyService } from 'src/engine/core-modules/inbound-webhook/services/inbound-webhook-verify.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([InboundWebhookSubscriptionEntity], 'core'),
  ],
  controllers: [InboundWebhookController],
  providers: [
    InboundWebhookDispatcherService,
    InboundWebhookIdempotencyService,
    InboundWebhookSubscriptionService,
    InboundWebhookVerifyService,
    GoogleMessagingInboundWebhookHandler,
    GoogleCalendarInboundWebhookHandler,
    MicrosoftMessagingInboundWebhookHandler,
    MicrosoftCalendarInboundWebhookHandler,
    InboundEmailSesInboundWebhookHandler,
    ProcessInboundWebhookJob,
    InboundWebhookRenewalCronJob,
    InboundWebhookRenewalCronCommand,
  ],
  exports: [InboundWebhookSubscriptionService],
})
export class InboundWebhookModule {}
