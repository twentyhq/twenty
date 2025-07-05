import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Webhook } from './webhook.entity';
import { WebhookResolver } from './webhook.resolver';
import { WebhookService } from './webhook.service';

@Module({
  imports: [TypeOrmModule.forFeature([Webhook], 'core')],
  providers: [WebhookService, WebhookResolver],
  exports: [WebhookService, TypeOrmModule],
})
export class WebhookModule {}
