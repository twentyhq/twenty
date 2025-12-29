import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FixNanPositionValuesInNotesCommand } from 'src/database/commands/upgrade-version-command/1-15/1-15-fix-nan-position-values-in-notes.command';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorkspaceEntity]), DataSourceModule],
  providers: [FixNanPositionValuesInNotesCommand],
  exports: [FixNanPositionValuesInNotesCommand],
})
export class V1_15_UpgradeVersionCommandModule {}
