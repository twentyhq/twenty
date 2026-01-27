import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';
import { WebhookModule } from 'src/engine/metadata-modules/webhook/webhook.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

import { WebhookController } from './controllers/webhook.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebhookEntity]),
    AuthModule,
    WorkspaceCacheStorageModule,
    WebhookModule,
    PermissionsModule,
  ],
  controllers: [WebhookController],
  exports: [TypeOrmModule],
})
export class CoreWebhookModule {}
