import { Module } from '@nestjs/common';

import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { UsageModule } from 'src/engine/core-modules/usage/usage.module';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { AiModelsModule } from 'src/engine/metadata-modules/ai/ai-models/ai-models.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [AiModelsModule, BillingModule, UsageModule, WorkspaceCacheModule],
  providers: [AiBillingService],
  exports: [AiBillingService],
})
export class AiBillingModule {}
