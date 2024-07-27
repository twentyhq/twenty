import { Module } from '@nestjs/common';

import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { OnboardingResolver } from 'src/engine/core-modules/onboarding/onboarding.resolver';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { EnvironmentModule } from 'src/engine/integrations/environment/environment.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceManagerModule } from 'src/engine/workspace-manager/workspace-manager.module';

@Module({
  imports: [
    DataSourceModule,
    WorkspaceManagerModule,
    UserWorkspaceModule,
    EnvironmentModule,
    BillingModule,
    UserVarsModule,
  ],
  exports: [OnboardingService],
  providers: [OnboardingService, OnboardingResolver],
})
export class OnboardingModule {}
