import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { WebhookModule } from 'src/engine/core-modules/webhook/webhook.module';
import { CallWebhookJobsJob } from 'src/engine/core-modules/webhook/jobs/call-webhook-jobs.job';
import { CallWebhookJob } from 'src/engine/core-modules/webhook/jobs/call-webhook.job';

@Module({
  imports: [HttpModule, AuditModule, WebhookModule],
  providers: [CallWebhookJobsJob, CallWebhookJob],
})
export class WebhookJobModule {}
