import { Query, Resolver } from '@nestjs/graphql';

import { DomainManagerService } from 'src/engine/core-modules/domain-manager/service/domain-manager.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

import { ClientConfig } from './client-config.entity';

@Resolver()
export class ClientConfigResolver {
  constructor(
    private environmentService: EnvironmentService,
    private domainManagerService: DomainManagerService,
  ) {}

  @Query(() => ClientConfig)
  async clientConfig(): Promise<ClientConfig> {
    const clientConfig: ClientConfig = {
      billing: {
        isBillingEnabled: this.environmentService.get('IS_BILLING_ENABLED'),
        billingUrl: this.environmentService.get('BILLING_PLAN_REQUIRED_LINK'),
        trialPeriods: [
          {
            duration: this.environmentService.get(
              'BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS',
            ),
            isCreditCardRequired: true,
          },
          {
            duration: this.environmentService.get(
              'BILLING_FREE_TRIAL_WITHOUT_CREDIT_CARD_DURATION_IN_DAYS',
            ),
            isCreditCardRequired: false,
          },
        ],
      },
      authProviders: {
        google: this.environmentService.get('AUTH_GOOGLE_ENABLED'),
        magicLink: false,
        password: this.environmentService.get('AUTH_PASSWORD_ENABLED'),
        microsoft: this.environmentService.get('AUTH_MICROSOFT_ENABLED'),
        sso: [],
      },
      signInPrefilled: this.environmentService.get('SIGN_IN_PREFILLED'),
      isMultiWorkspaceEnabled: this.environmentService.get(
        'IS_MULTIWORKSPACE_ENABLED',
      ),
      isEmailVerificationRequired: this.environmentService.get(
        'IS_EMAIL_VERIFICATION_REQUIRED',
      ),
      defaultSubdomain: this.environmentService.get('DEFAULT_SUBDOMAIN'),
      frontDomain: this.domainManagerService.getFrontUrl().hostname,
      debugMode: this.environmentService.get('DEBUG_MODE'),
      support: {
        supportDriver: this.environmentService.get('SUPPORT_DRIVER'),
        supportFrontChatId: this.environmentService.get(
          'SUPPORT_FRONT_CHAT_ID',
        ),
      },
      sentry: {
        environment: this.environmentService.get('SENTRY_ENVIRONMENT'),
        release: this.environmentService.get('SENTRY_RELEASE'),
        dsn: this.environmentService.get('SENTRY_FRONT_DSN'),
      },
      captcha: {
        provider: this.environmentService.get('CAPTCHA_DRIVER'),
        siteKey: this.environmentService.get('CAPTCHA_SITE_KEY'),
      },
      chromeExtensionId: this.environmentService.get('CHROME_EXTENSION_ID'),
      api: {
        mutationMaximumAffectedRecords: this.environmentService.get(
          'MUTATION_MAXIMUM_AFFECTED_RECORDS',
        ),
      },
      analyticsEnabled: this.environmentService.get('ANALYTICS_ENABLED'),
      canManageFeatureFlags:
        this.environmentService.get('DEBUG_MODE') ||
        this.environmentService.get('IS_BILLING_ENABLED'),
    };

    return Promise.resolve(clientConfig);
  }
}
