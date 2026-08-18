import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ConnectionProviderOAuthFlowService } from 'src/engine/core-modules/application/connection-provider/connection-provider-oauth-flow.service';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import {
  ONBOARDING_SLACK_APPLICATION_UNIVERSAL_IDENTIFIER,
  ONBOARDING_SLACK_CONNECTION_PROVIDER_NAME,
} from 'src/engine/core-modules/onboarding/constants/onboarding-slack-application.constant';
import {
  OnboardingException,
  OnboardingExceptionCode,
} from 'src/engine/core-modules/onboarding/onboarding.exception';

@Injectable()
export class OnboardingSlackConnectService {
  constructor(
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationInstallService: ApplicationInstallService,
    private readonly applicationService: ApplicationService,
    private readonly connectionProviderService: ConnectionProviderService,
    private readonly connectionProviderOAuthFlowService: ConnectionProviderOAuthFlowService,
  ) {}

  async startAuthorizationFlow({
    userId,
    workspaceId,
    userWorkspaceId,
    redirectLocation,
  }: {
    userId: string;
    workspaceId: string;
    userWorkspaceId: string;
    redirectLocation: string;
  }): Promise<{ authorizationUrl: string }> {
    const application = await this.installSlackApplication({ workspaceId });

    const connectionProvider =
      await this.connectionProviderService.findOneByApplicationAndName({
        applicationId: application.id,
        name: ONBOARDING_SLACK_CONNECTION_PROVIDER_NAME,
      });

    if (!isDefined(connectionProvider)) {
      throw new OnboardingException(
        `Slack application ${application.id} has no "${ONBOARDING_SLACK_CONNECTION_PROVIDER_NAME}" connection provider`,
        OnboardingExceptionCode.SLACK_CONNECT_UNAVAILABLE,
      );
    }

    // Workspace visibility on purpose: the Slack bot token is shared by the
    // whole workspace, and the assistant prefers a workspace connection.
    return this.connectionProviderOAuthFlowService.startAuthorizationFlow({
      connectionProvider,
      workspaceId,
      userId,
      userWorkspaceId,
      visibility: 'workspace',
      reconnectingConnectedAccountId: null,
      redirectLocation,
    });
  }

  private async installSlackApplication({
    workspaceId,
  }: {
    workspaceId: string;
  }) {
    const existingApplication =
      await this.applicationService.findByUniversalIdentifier({
        universalIdentifier: ONBOARDING_SLACK_APPLICATION_UNIVERSAL_IDENTIFIER,
        workspaceId,
      });

    if (isDefined(existingApplication)) {
      return existingApplication;
    }

    const registration =
      await this.applicationRegistrationService.findOneByUniversalIdentifier(
        ONBOARDING_SLACK_APPLICATION_UNIVERSAL_IDENTIFIER,
      );

    if (!isDefined(registration)) {
      throw new OnboardingException(
        'Slack application registration not found on this instance',
        OnboardingExceptionCode.SLACK_CONNECT_UNAVAILABLE,
      );
    }

    // Installed synchronously rather than through the install-apps job: the
    // connection provider row only exists once the install has run, and the
    // OAuth redirect happens right after this call returns.
    await this.applicationInstallService.installApplication({
      appRegistrationId: registration.id,
      workspaceId,
    });

    const application = await this.applicationService.findByUniversalIdentifier(
      {
        universalIdentifier: ONBOARDING_SLACK_APPLICATION_UNIVERSAL_IDENTIFIER,
        workspaceId,
      },
    );

    if (!isDefined(application)) {
      throw new OnboardingException(
        `Slack application was not found in workspace ${workspaceId} after installation`,
        OnboardingExceptionCode.SLACK_CONNECT_INSTALL_FAILED,
      );
    }

    return application;
  }
}
