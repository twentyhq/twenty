import { Module } from '@nestjs/common';

import { AIBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { AiModelsModule } from 'src/engine/metadata-modules/ai/ai-models/ai-models.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';

@Module({
  imports: [WorkspaceEventEmitterModule, AiModelsModule],
  providers: [AIBillingService],
  exports: [AIBillingService],
})
export class AiBillingModule {}
