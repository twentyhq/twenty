import { Module } from '@nestjs/common';

import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { OnboardingResolver } from 'src/engine/core-modules/onboarding/onboarding.resolver';
import { KeyValuePairModule } from 'src/engine/core-modules/key-value-pair/key-value-pair.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';

@Module({
  imports: [DataSourceModule, UserWorkspaceModule, KeyValuePairModule],
  exports: [OnboardingService],
  providers: [OnboardingService, OnboardingResolver],
})
export class OnboardingModule {}
