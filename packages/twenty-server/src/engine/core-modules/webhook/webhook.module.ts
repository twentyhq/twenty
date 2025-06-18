import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WebhookEntity } from './webhook.entity';
import { WebhookResolver } from './webhook.resolver';
import { WebhookService } from './webhook.service';

@Module({
  imports: [TypeOrmModule.forFeature([WebhookEntity], 'core')],
  providers: [WebhookService, WebhookResolver],
  exports: [WebhookService, TypeOrmModule],
})
export class WebhookModule {}
