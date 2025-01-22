import { Injectable } from '@nestjs/common';

import { getRequestOriginByHeaders } from 'src/engine/core-modules/auth/utils/get-request-origin-by-headers';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class GuardErrorManagerService {
  constructor(private readonly domainManagerService: DomainManagerService) {}

  dispatchErrorFromGuard(
    context: any,
    err: any,
    redirectUrlParams?: {
      subdomain?: string;
      baseUrl?: string;
    },
  ) {
    const caller = getRequestOriginByHeaders(
      context,
      this.domainManagerService.getFrontUrl().hostname,
    );

    if (caller.callerType === 'internal-graphql-caller') {
      throw err;
    }

    context
      .switchToHttp()
      .getResponse()
      .redirect(
        this.domainManagerService
          .computeRedirectErrorUrl(
            err.message ?? 'Unknown error',
            caller.callerType === 'external-caller'
              ? redirectUrlParams
              : {
                  baseUrl: caller.url,
                },
          )
          .toString(),
      );
  }
}
