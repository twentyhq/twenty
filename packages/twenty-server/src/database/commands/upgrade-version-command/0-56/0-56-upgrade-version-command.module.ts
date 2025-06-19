import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransferApiKeyToCoreCommand } from 'src/database/commands/upgrade-version-command/0-56/0-56-transfer-api-key-data-to-core';
import { TransferWebhookToCoreCommand } from 'src/database/commands/upgrade-version-command/0-56/0-56-transfer-webhook-data-to-core';
import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { WebhookModule } from 'src/engine/core-modules/webhook/webhook.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, ApiKey], 'core'),
    WorkspaceDataSourceModule,
    WebhookModule,
  ],
  providers: [TransferWebhookToCoreCommand, TransferApiKeyToCoreCommand],
  exports: [TransferWebhookToCoreCommand, TransferApiKeyToCoreCommand],
})
export class V0_56_UpgradeVersionCommandModule {}
