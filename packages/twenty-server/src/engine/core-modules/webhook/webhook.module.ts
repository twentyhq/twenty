import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';
import { WebhookModule } from 'src/engine/metadata-modules/webhook/webhook.module';

@Module({
  imports: [TypeOrmModule.forFeature([WebhookEntity]), WebhookModule],
  exports: [TypeOrmModule],
})
export class CoreWebhookModule {}
