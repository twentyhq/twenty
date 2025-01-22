import { Injectable } from '@nestjs/common';

import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { getCallerByContext } from 'src/engine/core-modules/guard-manager/utils/get-caller-by-context';

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
    const caller = getCallerByContext(
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
