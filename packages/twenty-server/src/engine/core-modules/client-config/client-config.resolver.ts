import { Query, Resolver } from '@nestjs/graphql';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

import { ClientConfig } from './client-config.entity';

@Resolver()
export class ClientConfigResolver {
  constructor(private environmentService: EnvironmentService) {}

  @Query(() => ClientConfig)
  async clientConfig(): Promise<ClientConfig> {
    const clientConfig: ClientConfig = {
      authProviders: {
        google: this.environmentService.get('AUTH_GOOGLE_ENABLED'),
        magicLink: false,
        password: this.environmentService.get('AUTH_PASSWORD_ENABLED'),
        microsoft: this.environmentService.get('AUTH_MICROSOFT_ENABLED'),
      },
      billing: {
        isBillingEnabled: this.environmentService.get('IS_BILLING_ENABLED'),
        billingUrl: this.environmentService.get('BILLING_PLAN_REQUIRED_LINK'),
        billingFreeTrialDurationInDays: this.environmentService.get(
          'BILLING_FREE_TRIAL_DURATION_IN_DAYS',
        ),
      },
      signInPrefilled: this.environmentService.get('SIGN_IN_PREFILLED'),
      signUpDisabled: this.environmentService.get('IS_SIGN_UP_DISABLED'),
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
    };

    return Promise.resolve(clientConfig);
  }
}
