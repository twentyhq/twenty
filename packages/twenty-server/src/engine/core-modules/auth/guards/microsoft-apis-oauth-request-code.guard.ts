import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { MicrosoftAPIsOauthRequestCodeStrategy } from 'src/engine/core-modules/auth/strategies/microsoft-apis-oauth-request-code.auth.strategy';
import { TransientTokenService } from 'src/engine/core-modules/auth/token/services/transient-token.service';
import { setRequestExtraParams } from 'src/engine/core-modules/auth/utils/google-apis-set-request-extra-params.util';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';

@Injectable()
export class MicrosoftAPIsOauthRequestCodeGuard extends AuthGuard(
  'microsoft-apis',
) {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly transientTokenService: TransientTokenService,
  ) {
    super({
      prompt: 'select_account',
    });
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const { workspaceId } =
      await this.transientTokenService.verifyTransientToken(
        request.query.transientToken,
      );
    const isMicrosoftSyncEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IsMicrosoftSyncEnabled,
        workspaceId,
      );

    if (!isMicrosoftSyncEnabled) {
      throw new AuthException(
        'Microsoft sync is not enabled',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    new MicrosoftAPIsOauthRequestCodeStrategy(this.environmentService);
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
