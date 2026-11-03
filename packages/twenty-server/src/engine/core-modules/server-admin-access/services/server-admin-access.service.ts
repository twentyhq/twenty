import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// Edge rules alone were bypassed by custom hostnames, so the origin pins server administration to the console host.
@Injectable()
export class ServerAdminAccessService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  getAdminConsoleUrl(): URL | undefined {
    const adminConsoleUrl = this.twentyConfigService.get('ADMIN_CONSOLE_URL');

    return isNonEmptyString(adminConsoleUrl)
      ? new URL(adminConsoleUrl)
      : undefined;
  }

  isRequestOnAdminConsoleHost(request: Request): boolean {
    const adminConsoleUrl = this.getAdminConsoleUrl();

    return (
      isDefined(adminConsoleUrl) &&
      request.get('host')?.toLowerCase() === adminConsoleUrl.host
    );
  }

  // Without a configured console (self-hosting), administration stays available on every host.
  isRequestAllowed(request: Request): boolean {
    return (
      !isDefined(this.getAdminConsoleUrl()) ||
      this.isRequestOnAdminConsoleHost(request)
    );
  }
}
