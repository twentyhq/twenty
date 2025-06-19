import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransferWebhookToCoreCommand } from 'src/database/commands/upgrade-version-command/0-56/0-56-transfer-webhook-data-to-core';
import { WebhookModule } from 'src/engine/core-modules/webhook/webhook.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    WorkspaceDataSourceModule,
    WebhookModule,
  ],
  providers: [TransferWebhookToCoreCommand],
  exports: [TransferWebhookToCoreCommand],
})
export class V0_56_UpgradeVersionCommandModule {}
