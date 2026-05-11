import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { OnboardingResolver } from 'src/engine/core-modules/onboarding/onboarding.resolver';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    BillingModule,
    UserVarsModule,
    FeatureFlagModule,
    TypeOrmModule.forFeature([WorkspaceEntity]),
  ],
  exports: [OnboardingService],
  providers: [OnboardingService, OnboardingResolver],
})
export class OnboardingModule {}
