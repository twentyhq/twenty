import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ConnectionProviderModule } from 'src/engine/core-modules/application/connection-provider/connection-provider.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { OnboardingResolver } from 'src/engine/core-modules/onboarding/onboarding.resolver';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { OnboardingSlackAvailabilityService } from 'src/engine/core-modules/onboarding/services/onboarding-slack-availability.service';
import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { OnboardingInviteSuggestionsModule } from 'src/modules/onboarding-invite-suggestions/onboarding-invite-suggestions.module';

@Module({
  imports: [
    BillingModule,
    ConnectionProviderModule,
    UserVarsModule,
    OnboardingInviteSuggestionsModule,
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      UserWorkspaceEntity,
      ApplicationRegistrationEntity,
    ]),
  ],
  exports: [OnboardingService, OnboardingSlackAvailabilityService],
  providers: [
    OnboardingService,
    OnboardingResolver,
    OnboardingSlackAvailabilityService,
  ],
})
export class OnboardingModule {}
