import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InboundWebhookRenewalCronCommand } from 'src/engine/core-modules/inbound-webhook/crons/commands/inbound-webhook-renewal.cron.command';
import { InboundWebhookRenewalCronJob } from 'src/engine/core-modules/inbound-webhook/crons/jobs/inbound-webhook-renewal.cron.job';
import { InboundWebhookController } from 'src/engine/core-modules/inbound-webhook/controllers/inbound-webhook.controller';
import { InboundWebhookSubscriptionEntity } from 'src/engine/core-modules/inbound-webhook/entities/inbound-webhook-subscription.entity';
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
    ProcessInboundWebhookJob,
    InboundWebhookRenewalCronJob,
    InboundWebhookRenewalCronCommand,
  ],
  exports: [
    InboundWebhookDispatcherService,
    InboundWebhookSubscriptionService,
    InboundWebhookVerifyService,
  ],
})
export class InboundWebhookModule {}
