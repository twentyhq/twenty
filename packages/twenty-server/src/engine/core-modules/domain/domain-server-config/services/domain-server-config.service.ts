import { Injectable } from '@nestjs/common';

import { buildUrlWithPathnameAndSearchParams } from 'src/engine/core-modules/domain/domain-server-config/utils/build-url-with-pathname-and-search-params.util';
import { getSubdomainAndCustomDomainFromHostname } from 'src/engine/core-modules/domain/domain-server-config/utils/get-subdomain-and-custom-domain-from-hostname.util';
import { getHostnameFromUrlOrUndefined } from 'src/engine/core-modules/domain/domain-server-config/utils/public-function-domain.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class DomainServerConfigService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  getFrontUrl() {
    return new URL(
      this.twentyConfigService.get('FRONTEND_URL') ??
        this.twentyConfigService.get('SERVER_URL'),
    );
  }

  getBaseUrl(): URL {
    const baseUrl = this.getFrontUrl();

    if (
      this.twentyConfigService.get('IS_MULTIWORKSPACE_ENABLED') &&
      this.twentyConfigService.get('DEFAULT_SUBDOMAIN')
    ) {
      baseUrl.hostname = `${this.twentyConfigService.get('DEFAULT_SUBDOMAIN')}.${baseUrl.hostname}`;
    }

    return baseUrl;
  }

  getPublicDomainUrl(): URL {
    return new URL(this.twentyConfigService.get('PUBLIC_DOMAIN_URL'));
  }

  getPublicBaseHostnameOrUndefined(): string | undefined {
    return getHostnameFromUrlOrUndefined(
      this.twentyConfigService.get('PUBLIC_DOMAIN_URL'),
    );
  }

  buildBaseUrl({
    pathname,
    searchParams,
    hash,
  }: {
    pathname?: string;
    searchParams?: Record<string, string | number>;
    hash?: string;
  }) {
    return buildUrlWithPathnameAndSearchParams({
      baseUrl: this.getBaseUrl(),
      pathname,
      searchParams,
      hash,
    });
  }

  getSubdomainAndCustomDomainFromUrl = (url: string) =>
    getSubdomainAndCustomDomainFromHostname({
      hostname: new URL(url).hostname,
      frontDomain: this.getFrontUrl().hostname,
      publicBaseDomain: this.getPublicBaseHostnameOrUndefined(),
      defaultSubdomain: this.twentyConfigService.get('DEFAULT_SUBDOMAIN'),
    });
}
