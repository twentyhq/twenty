import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { GoogleAPIsOauthRequestCodeStrategy } from 'src/engine/core-modules/auth/strategies/google-apis-oauth-request-code.auth.strategy';
import { setRequestExtraParams } from 'src/engine/core-modules/auth/utils/google-apis-set-request-extra-params.util';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { TokenService } from 'src/engine/core-modules/auth/token/services/token.service';

@Injectable()
export class GoogleAPIsOauthRequestCodeGuard extends AuthGuard('google-apis') {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly tokenService: TokenService,
  ) {
    super({
      prompt: 'select_account',
    });
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const { workspaceId } = await this.tokenService.verifyTransientToken(
      request.query.transientToken,
    );
    const isGmailSendEmailScopeEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IsGmailSendEmailScopeEnabled,
        workspaceId,
      );

    if (
      !this.environmentService.get('MESSAGING_PROVIDER_GMAIL_ENABLED') &&
      !this.environmentService.get('CALENDAR_PROVIDER_GOOGLE_ENABLED')
    ) {
      throw new AuthException(
        'Google apis auth is not enabled',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    new GoogleAPIsOauthRequestCodeStrategy(
      this.environmentService,
      {},
      isGmailSendEmailScopeEnabled,
    );
    setRequestExtraParams(request, {
      transientToken: request.query.transientToken,
      redirectLocation: request.query.redirectLocation,
      calendarVisibility: request.query.calendarVisibility,
      messageVisibility: request.query.messageVisibility,
      loginHint: request.query.loginHint,
    });

    const activate = (await super.canActivate(context)) as boolean;

    return activate;
  }
}
