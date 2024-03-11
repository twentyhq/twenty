import { Injectable, CanActivate, NotFoundException } from '@nestjs/common';

import { Observable } from 'rxjs';

import { GoogleAPIsStrategy } from 'src/core/auth/strategies/google-apis.auth.strategy';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

@Injectable()
export class GoogleAPIsProviderEnabledGuard implements CanActivate {
  constructor(private readonly environmentService: EnvironmentService) {}

  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    if (
      !this.environmentService.isMessagingProviderGmailEnabled() &&
      !this.environmentService.isCalendarProviderGoogleEnabled()
    ) {
      throw new NotFoundException('Google apis auth is not enabled');
    }

    new GoogleAPIsStrategy(this.environmentService);

    return true;
  }
}
