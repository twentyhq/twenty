import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransferWebhookAndApiKeyToCoreCommand } from 'src/database/commands/upgrade-version-command/0-56/0-56-transfer-webhook-and-api-key-data-to-core';
import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { WebhookModule } from 'src/engine/core-modules/webhook/webhook.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, ApiKey], 'core'),
    WorkspaceDataSourceModule,
    WebhookModule,
    ApiKeyModule,
  ],
  providers: [TransferWebhookAndApiKeyToCoreCommand],
  exports: [TransferWebhookAndApiKeyToCoreCommand],
})
export class V0_56_UpgradeVersionCommandModule {}
