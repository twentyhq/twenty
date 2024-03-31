import { Injectable, CanActivate, NotFoundException } from '@nestjs/common';

import { Observable } from 'rxjs';

import { GoogleAPIsStrategy } from 'src/engine/core-modules/auth/strategies/google-apis.auth.strategy';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

@Injectable()
export class GoogleGmailProviderEnabledGuard implements CanActivate {
  constructor(private readonly environmentService: EnvironmentService) {}

  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    if (!this.environmentService.get('MESSAGING_PROVIDER_GMAIL_ENABLED')) {
      throw new NotFoundException('Gmail auth is not enabled');
    }

    new GoogleAPIsStrategy(this.environmentService);

    return true;
  }
}
