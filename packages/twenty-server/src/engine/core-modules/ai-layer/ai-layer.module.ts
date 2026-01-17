import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { AILayerService } from './ai-layer.service';
import { AILayerWebhookService } from './webhooks/ai-layer-webhook.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),
  ],
  providers: [AILayerService, AILayerWebhookService],
  exports: [AILayerService, AILayerWebhookService],
})
export class AILayerModule {}
