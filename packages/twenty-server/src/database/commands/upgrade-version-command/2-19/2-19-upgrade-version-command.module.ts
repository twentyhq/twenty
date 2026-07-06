import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillActorSourceEnumValuesCommand } from 'src/database/commands/upgrade-version-command/2-19/2-19-workspace-command-1783100000000-backfill-actor-source-enum-values.command';
import { BackfillWorkspaceCustomApplicationRegistrationCommand } from 'src/database/commands/upgrade-version-command/2-19/2-19-workspace-command-1782853718000-backfill-workspace-custom-application-registration.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    ApplicationModule,
    TypeOrmModule.forFeature([WorkspaceEntity, ApplicationEntity]),
    WorkspaceIteratorModule,
    WorkspaceCacheModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    BackfillWorkspaceCustomApplicationRegistrationCommand,
    BackfillActorSourceEnumValuesCommand,
  ],
})
export class V2_19_UpgradeVersionCommandModule {}
