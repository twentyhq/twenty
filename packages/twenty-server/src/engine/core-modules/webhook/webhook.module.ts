import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { WebhookEntity } from 'src/engine/core-modules/webhook/webhook.entity';
import { WebhookResolver } from 'src/engine/core-modules/webhook/webhook.resolver';
import { WebhookService } from 'src/engine/core-modules/webhook/webhook.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

import { WebhookController } from './controllers/webhook.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebhookEntity]),
    AuthModule,
    PermissionsModule,
    WorkspaceCacheStorageModule,
  ],
  providers: [WebhookService, WebhookResolver],
  controllers: [WebhookController],
  exports: [WebhookService, TypeOrmModule],
})
export class WebhookModule {}
