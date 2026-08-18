import { Module } from '@nestjs/common';

import { ApplicationInstallModule } from 'src/engine/core-modules/application/application-install/application-install.module';
import { ApplicationRegistrationModule } from 'src/engine/core-modules/application/application-registration/application-registration.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ConnectionProviderModule } from 'src/engine/core-modules/application/connection-provider/connection-provider.module';
import { OnboardingSlackConnectResolver } from 'src/engine/core-modules/onboarding/onboarding-slack-connect.resolver';
import { OnboardingModule } from 'src/engine/core-modules/onboarding/onboarding.module';
import { OnboardingSlackConnectionListener } from 'src/engine/core-modules/onboarding/listeners/onboarding-slack-connection.listener';
import { OnboardingSlackConnectService } from 'src/engine/core-modules/onboarding/services/onboarding-slack-connect.service';

@Module({
  imports: [
    ApplicationModule,
    ApplicationInstallModule,
    ApplicationRegistrationModule,
    ConnectionProviderModule,
    OnboardingModule,
  ],
  providers: [
    OnboardingSlackConnectService,
    OnboardingSlackConnectResolver,
    OnboardingSlackConnectionListener,
  ],
})
export class OnboardingSlackConnectModule {}
