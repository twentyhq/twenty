import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { buildUrlWithPathnameAndSearchParams } from 'src/engine/core-modules/domain/domain-server-config/utils/build-url-with-pathname-and-search-params.util';
import {
  getHostnameFromUrlOrUndefined,
  isHostUnderPublicFunctionDomain,
} from 'src/engine/core-modules/domain/domain-server-config/utils/public-function-domain.util';
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

  getSubdomainAndDomainFromUrl = (url: string) => {
    const { hostname: originHostname } = new URL(url);

    const frontDomain = this.getFrontUrl().hostname;

    const isFrontdomain = originHostname.endsWith(`.${frontDomain}`);

    if (isFrontdomain) {
      const subdomain = originHostname.replace(`.${frontDomain}`, '');

      return {
        subdomain: this.isDefaultSubdomain(subdomain) ? undefined : subdomain,
        domain: null,
        isPublicDomainOrigin: false,
      };
    }

    const publicBaseDomain = this.getPublicBaseHostnameOrUndefined();

    if (
      isDefined(publicBaseDomain) &&
      isHostUnderPublicFunctionDomain({
        host: originHostname,
        publicDomainBaseHostname: publicBaseDomain,
      })
    ) {
      const subdomain = originHostname.replace(`.${publicBaseDomain}`, '');

      return {
        subdomain: this.isDefaultSubdomain(subdomain) ? undefined : subdomain,
        domain: null,
        isPublicDomainOrigin: true,
      };
    }

    return {
      subdomain: undefined,
      domain: originHostname,
      isPublicDomainOrigin: false,
    };
  };

  isDefaultSubdomain(subdomain: string) {
    return subdomain === this.twentyConfigService.get('DEFAULT_SUBDOMAIN');
  }
}
