import { Injectable } from '@nestjs/common';

import { resolveAndValidateHostname } from 'src/engine/core-modules/secure-http-client/utils/resolve-and-validate-hostname.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class HostnameGuardService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  async getValidatedHost(hostnameOrUrl: string): Promise<string> {
    if (!this.isSafeModeEnabled()) {
      return hostnameOrUrl;
    }

    return resolveAndValidateHostname(hostnameOrUrl);
  }

  async getValidatedUrl(serverUrl: string): Promise<string> {
    if (!this.isSafeModeEnabled()) {
      return serverUrl;
    }

    const resolvedIp = await resolveAndValidateHostname(serverUrl);

    const url = new URL(serverUrl);

    url.hostname = resolvedIp;

    return url.toString();
  }

  private isSafeModeEnabled(): boolean {
    return this.twentyConfigService.get('OUTBOUND_HTTP_SAFE_MODE_ENABLED');
  }
}
