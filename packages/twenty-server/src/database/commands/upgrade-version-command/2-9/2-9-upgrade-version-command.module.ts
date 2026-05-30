import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { MigrateAiModelPreferencesCommand } from 'src/database/commands/upgrade-version-command/2-9/2-9-workspace-command-1799000000000-migrate-ai-model-preferences.command';
import { KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([KeyValuePairEntity]),
    WorkspaceIteratorModule,
  ],
  providers: [MigrateAiModelPreferencesCommand],
})
export class V2_9_UpgradeVersionCommandModule {}
