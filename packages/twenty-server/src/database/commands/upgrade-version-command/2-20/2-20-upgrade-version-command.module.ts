import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillActorSourceEnumValuesCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783499671542-backfill-actor-source-enum-values.command';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    WorkspaceIteratorModule,
    WorkspaceCacheModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [BackfillActorSourceEnumValuesCommand],
})
export class V2_20_UpgradeVersionCommandModule {}
