import { Injectable, CanActivate, NotFoundException } from '@nestjs/common';

import { Observable } from 'rxjs';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { MicrosoftStrategy } from 'src/engine/core-modules/auth/strategies/microsoft.auth.strategy';

@Injectable()
export class MicrosoftProviderEnabledGuard implements CanActivate {
  constructor(private readonly environmentService: EnvironmentService) {}

  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    if (!this.environmentService.get('AUTH_MICROSOFT_ENABLED')) {
      throw new NotFoundException('Microsoft auth is not enabled');
    }

    new MicrosoftStrategy(this.environmentService);

    return true;
  }
}
