import { ExecutionContext, Injectable } from '@nestjs/common';

import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class GuardRedirectService {
  constructor(
    private readonly domainManagerService: DomainManagerService,
    private readonly environmentService: EnvironmentService,
  ) {}



  dispatchErrorFromGuard(context: any, err: any, subdomain: string) {
    if ('contextType' in context && context.contextType === 'graphql') {
      throw err;
    }

    context
      .switchToHttp()
      .getResponse()
      .redirect(
        this.domainManagerService
          .computeRedirectErrorUrl(err.message ?? 'Unknown error', subdomain)
          .toString(),
      );
  }

  getSubdomainFromContext(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const subdomainFromUrl =
      this.domainManagerService.getWorkspaceSubdomainFromUrl(
        request.headers.referer,
      );

    return subdomainFromUrl ?? this.environmentService.get('DEFAULT_SUBDOMAIN');
  }
}
