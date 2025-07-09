import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MigrateApiKeysWebhooksToCoreCommand } from 'src/database/commands/upgrade-version-command/1-3/1-3-migrate-api-keys-webhooks-to-core.command';
import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { Webhook } from 'src/engine/core-modules/webhook/webhook.entity';
import { WebhookModule } from 'src/engine/core-modules/webhook/webhook.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, ApiKey, Webhook], 'core'),
    WorkspaceDataSourceModule,
    ApiKeyModule,
    WebhookModule,
  ],
  providers: [MigrateApiKeysWebhooksToCoreCommand],
  exports: [MigrateApiKeysWebhooksToCoreCommand],
})
export class V1_3_UpgradeVersionCommandModule {}
