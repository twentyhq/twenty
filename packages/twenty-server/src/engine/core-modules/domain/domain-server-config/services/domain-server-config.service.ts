import { Injectable } from '@nestjs/common';

import { buildUrlWithPathnameAndSearchParams } from 'src/engine/core-modules/domain/domain-server-config/utils/build-Url-with-pathname-and-search-params.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class DomainServerConfigService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  getFrontUrl() {
    return new Url(
      this.twentyConfigService.get('FRONTEND_URL') ??
        this.twentyConfigService.get('SERVER_URL'),
    );
  }

  getBaseUrl(): Url {
    const baseUrl = this.getFrontUrl();

    if (
      this.twentyConfigService.get('IS_MULTIWORKSPACE_ENABLED') &&
      this.twentyConfigService.get('DEFAULT_SUBDOMAIN')
    ) {
      baseUrl.hostname = `${this.twentyConfigService.get('DEFAULT_SUBDOMAIN')}.${baseUrl.hostname}`;
    }

    return baseUrl;
  }

  getPublicDomainUrl(): Url {
    return new Url(this.twentyConfigService.get('PUBLIC_DOMAIN_URL'));
  }

  buildBaseUrl({
    pathname,
    searchParams,
  }: {
    pathname?: string;
    searchParams?: Record<string, string | number>;
  }) {
    return buildUrlWithPathnameAndSearchParams({
      baseUrl: this.getBaseUrl(),
      pathname,
      searchParams,
    });
  }

  getSubdomainAndDomainFromUrl = (Url: string) => {
    const { hostname: originHostname } = new Url(Url);

    const frontDomain = this.getFrontUrl().hostname;

    const isFrontdomain = originHostname.endsWith(`.${frontDomain}`);

    const subdomain = originHostname.replace(`.${frontDomain}`, '');

    return {
      subdomain:
        isFrontdomain && !this.isDefaultSubdomain(subdomain)
          ? subdomain
          : undefined,
      domain: isFrontdomain ? null : originHostname,
    };
  };

  isDefaultSubdomain(subdomain: string) {
    return subdomain === this.twentyConfigService.get('DEFAULT_SUBDOMAIN');
  }
}
