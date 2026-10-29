import { Module } from '@nestjs/common';

import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { GettingStartedWorkflowResolver } from 'src/engine/core-modules/getting-started/getting-started-workflow.resolver';
import { GettingStartedWorkflowWorkspaceService } from 'src/engine/core-modules/getting-started/services/getting-started-workflow.workspace-service';
import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { CoreWorkflowServicesModule } from 'src/engine/core-modules/workflow/core-workflow-services.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    CacheLockModule,
    CoreWorkflowServicesModule,
    FeatureFlagModule,
    PermissionsModule,
    UserVarsModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    GettingStartedWorkflowWorkspaceService,
    GettingStartedWorkflowResolver,
  ],
})
export class GettingStartedWorkflowModule {}
