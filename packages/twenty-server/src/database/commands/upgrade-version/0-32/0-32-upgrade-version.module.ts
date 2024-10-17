import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EnforceUniqueConstraintsCommand } from 'src/database/commands/upgrade-version/0-32/0-32-enforce-unique-constraints.command';
import { UpgradeTo0_32Command } from 'src/database/commands/upgrade-version/0-32/0-32-upgrade-version.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceSyncMetadataCommandsModule } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/workspace-sync-metadata-commands.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    TypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
    WorkspaceSyncMetadataCommandsModule,
  ],
  providers: [UpgradeTo0_32Command, EnforceUniqueConstraintsCommand],
})
export class UpgradeTo0_32CommandModule {}
