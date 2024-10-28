import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { UpgradeTo0_33Command } from 'src/database/commands/upgrade-version/0-33/0-33-generate-subdomain.command';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace], 'core')],
  providers: [UpgradeTo0_33Command],
})
export class UpgradeTo0_33CommandModule {}
