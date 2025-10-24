import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { CallWebhookJobsJob } from 'src/engine/core-modules/webhook/jobs/call-webhook-jobs.job';
import { CallWebhookJob } from 'src/engine/core-modules/webhook/jobs/call-webhook.job';
import { WebhookModule } from 'src/engine/core-modules/webhook/webhook.module';

@Module({
  imports: [HttpModule, AuditModule, WebhookModule, MetricsModule],
  providers: [CallWebhookJobsJob, CallWebhookJob],
})
export class WebhookJobModule {}
