import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssignRolesToExistingApiKeysCommand } from 'src/database/commands/upgrade-version-command/1-2/1-2-assign-roles-to-existing-api-keys.command';
import { RemoveWorkflowRunsWithoutState } from 'src/database/commands/upgrade-version-command/1-2/1-2-remove-workflow-runs-without-state.command';
import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Workspace, ApiKey, RoleEntity, RoleTargetsEntity],
      'core',
    ),
    TwentyORMModule,
    ApiKeyModule,
    RoleModule,
  ],
  providers: [
    AssignRolesToExistingApiKeysCommand,
    RemoveWorkflowRunsWithoutState,
  ],
  exports: [
    AssignRolesToExistingApiKeysCommand,
    RemoveWorkflowRunsWithoutState,
  ],
})
export class V1_2_UpgradeVersionCommandModule {}
