import { Injectable } from '@nestjs/common';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { isDefined } from 'src/utils/is-defined';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class UrlManagerService {
  constructor(private readonly environmentService: EnvironmentService) {}

  getBaseUrl() {
    const baseUrl = new URL(
      `${this.environmentService.get('FRONT_PROTOCOL')}://${this.environmentService.get('FRONT_DOMAIN')}`,
    );

    if (
      this.environmentService.get('IS_MULTIWORKSPACE_ENABLED') &&
      this.environmentService.get('DEFAULT_SUBDOMAIN')
    ) {
      baseUrl.hostname = `${this.environmentService.get('DEFAULT_SUBDOMAIN')}.${baseUrl.hostname}`;
    }

    if (this.environmentService.get('FRONT_PORT')) {
      baseUrl.port = this.environmentService.get('FRONT_PORT').toString();
    }

    return baseUrl;
  }

  buildWorkspaceURL({
    subdomain,
    pathname,
    searchParams,
  }: {
    subdomain?: string;
    pathname?: string;
    searchParams?: Record<string, string | number>;
  }) {
    const url = this.getBaseUrl();

    if (
      this.environmentService.get('IS_MULTIWORKSPACE_ENABLED') &&
      !subdomain
    ) {
      throw new Error('subdomain is required when multiworkspace is enable');
    }

    if (
      subdomain &&
      subdomain.length > 0 &&
      this.environmentService.get('IS_MULTIWORKSPACE_ENABLED')
    ) {
      url.hostname = url.hostname.replace(
        this.environmentService.get('DEFAULT_SUBDOMAIN'),
        subdomain,
      );
    }

    if (pathname) {
      url.pathname = pathname;
    }

    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (isDefined(value)) {
          url.searchParams.set(key, value.toString());
        }
      });
    }

    return url;
  }

  getWorkspaceSubdomainByOrigin = (origin: string) => {
    const { hostname: originHostname } = new URL(origin);

    const subdomain = originHostname.replace(
      `.${this.environmentService.get('FRONT_DOMAIN')}`,
      '',
    );

    if (this.isDefaultSubdomain(subdomain)) {
      return;
    }

    return subdomain;
  };

  isDefaultSubdomain(subdomain: string) {
    return subdomain === this.environmentService.get('DEFAULT_SUBDOMAIN');
  }

  computeRedirectErrorUrl({
    errorMessage,
    subdomain,
  }: {
    errorMessage: string;
    subdomain?: string;
  }) {
    const url = this.buildWorkspaceURL({
      subdomain,
      pathname: '/verify',
      searchParams: { errorMessage },
    });

    return url.toString();
  }
}
