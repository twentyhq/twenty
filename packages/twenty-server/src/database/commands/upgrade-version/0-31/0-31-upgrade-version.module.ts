import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillWorkspaceFavoritesCommand } from 'src/database/commands/upgrade-version/0-31/0-31-backfill-workspace-favorites.command';
import { UpgradeTo0_31Command } from 'src/database/commands/upgrade-version/0-31/0-31-upgrade-version.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace], 'core')],
  providers: [UpgradeTo0_31Command, BackfillWorkspaceFavoritesCommand],
})
export class UpgradeTo0_31CommandModule {}
