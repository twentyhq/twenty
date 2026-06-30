import { Module } from '@nestjs/common';

import { ApplicationDeployPlanService } from 'src/engine/core-modules/application/application-deploy/application-deploy-plan.service';
import { ApplicationDeployPlanStoreService } from 'src/engine/core-modules/application/application-deploy/application-deploy-plan-store.service';
import { ApplicationManifestModule } from 'src/engine/core-modules/application/application-manifest/application-manifest.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [ApplicationModule, ApplicationManifestModule, WorkspaceCacheModule],
  providers: [ApplicationDeployPlanService, ApplicationDeployPlanStoreService],
  exports: [ApplicationDeployPlanService, ApplicationDeployPlanStoreService],
})
export class ApplicationDeployModule {}
