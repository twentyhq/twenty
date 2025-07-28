import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddEnqueuedStatusToWorkflowRunV2Command } from 'src/database/commands/upgrade-version-command/1-2/1-2-add-enqueued-status-to-workflow-run-v2.command';
import { AddNextStepIdsToWorkflowVersionTriggers } from 'src/database/commands/upgrade-version-command/1-2/1-2-add-next-step-ids-to-workflow-version-triggers.command';
import { AssignRolesToExistingApiKeysCommand } from 'src/database/commands/upgrade-version-command/1-2/1-2-assign-roles-to-existing-api-keys.command';
import { RemoveWorkflowRunsWithoutState } from 'src/database/commands/upgrade-version-command/1-2/1-2-remove-workflow-runs-without-state.command';
import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Workspace,
        ApiKey,
        FieldMetadataEntity,
        ObjectMetadataEntity,
        RoleEntity,
        RoleTargetsEntity,
      ],
      'core',
    ),
    RoleModule,
    WorkspaceDataSourceModule,
    ApiKeyModule,
    TwentyORMModule,
  ],
  providers: [
    RemoveWorkflowRunsWithoutState,
    AddEnqueuedStatusToWorkflowRunV2Command,
    AddNextStepIdsToWorkflowVersionTriggers,
    AssignRolesToExistingApiKeysCommand,
  ],
  exports: [
    RemoveWorkflowRunsWithoutState,
    AddEnqueuedStatusToWorkflowRunV2Command,
    AddNextStepIdsToWorkflowVersionTriggers,
    AssignRolesToExistingApiKeysCommand,
  ],
})
export class V1_2_UpgradeVersionCommandModule {}
