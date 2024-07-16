import { Injectable } from '@nestjs/common';

import { GoogleAPIsOauthCommonStrategy } from 'src/engine/core-modules/auth/strategies/google-apis-oauth-common.auth.strategy';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

export type GoogleAPIScopeConfig = {
  isCalendarEnabled?: boolean;
  isMessagingAliasFetchingEnabled?: boolean;
};

@Injectable()
export class GoogleAPIsOauthRequestCodeStrategy extends GoogleAPIsOauthCommonStrategy {
  constructor(
    environmentService: EnvironmentService,
    scopeConfig: GoogleAPIScopeConfig,
  ) {
    super(environmentService, scopeConfig);
  }

  authenticate(req: any, options: any) {
    options = {
      ...options,
      accessType: 'offline',
      prompt: 'consent',
      state: JSON.stringify({
        transientToken: req.params.transientToken,
        redirectLocation: req.params.redirectLocation,
        calendarVisibility: req.params.calendarVisibility,
        messageVisibility: req.params.messageVisibility,
      }),
    };

    return super.authenticate(req, options);
  }
}
