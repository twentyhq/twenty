import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MigrationCommandModule } from 'src/database/commands/migration-command/migration-command.module';
import { InitializePermissionsCommand } from 'src/database/commands/upgrade-version/0-44/0-44-initialize-permissions.command';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';

@Module({
  imports: [
    MigrationCommandModule.register('0.44', {
      imports: [
        RoleModule,
        TypeOrmModule.forFeature([Workspace, UserWorkspace], 'core'),
        UserRoleModule,
      ],
      providers: [InitializePermissionsCommand],
    }),
  ],
})
export class UpgradeTo0_44CommandModule {}