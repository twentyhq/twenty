import { Module } from '@nestjs/common';

import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { AiModelsModule } from 'src/engine/metadata-modules/ai/ai-models/ai-models.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';

@Module({
  imports: [
    WorkspaceEventEmitterModule,
    AiModelsModule,
    BillingModule,
    WorkspaceCacheModule,
  ],
  providers: [AiBillingService],
  exports: [AiBillingService],
})
export class AiBillingModule {}
