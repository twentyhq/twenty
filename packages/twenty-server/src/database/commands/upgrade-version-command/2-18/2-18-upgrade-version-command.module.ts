import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillWorkspaceCustomApplicationRegistrationCommand } from 'src/database/commands/upgrade-version-command/2-18/2-18-workspace-command-1810000005000-backfill-workspace-custom-application-registration.command';
import { NormalizeLegacyIndexNamesCommand } from 'src/database/commands/upgrade-version-command/2-18/2-18-workspace-command-1799200000000-normalize-legacy-index-names.command';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      ApplicationEntity,
      ApplicationRegistrationEntity,
    ]),
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    NormalizeLegacyIndexNamesCommand,
    BackfillWorkspaceCustomApplicationRegistrationCommand,
  ],
})
export class V2_18_UpgradeVersionCommandModule {}
