import { ExecutionContext, Injectable } from '@nestjs/common';

import { Request } from 'express';

import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { CustomException } from 'src/utils/custom-exception';

@Injectable()
export class GuardRedirectService {
  constructor(
    private readonly domainManagerService: DomainManagerService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  dispatchErrorFromGuard(
    context: ExecutionContext,
    error: Error | CustomException,
    workspace: {
      id?: string;
      subdomain: string;
      customDomain: string | null;
      isCustomDomainEnabled?: boolean;
    },
  ) {
    if ('contextType' in context && context.contextType === 'graphql') {
      throw error;
    }

    context
      .switchToHttp()
      .getResponse()
      .redirect(this.getRedirectErrorUrlAndCaptureExceptions(error, workspace));
  }

  getSubdomainAndCustomDomainFromContext(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    const subdomainAndCustomDomainFromReferer = request.headers.referer
      ? this.domainManagerService.getSubdomainAndCustomDomainFromUrl(
          request.headers.referer,
        )
      : null;

    return subdomainAndCustomDomainFromReferer &&
      subdomainAndCustomDomainFromReferer.subdomain
      ? {
          subdomain: subdomainAndCustomDomainFromReferer.subdomain,
          customDomain: subdomainAndCustomDomainFromReferer.customDomain,
        }
      : {
          subdomain: this.twentyConfigService.get('DEFAULT_SUBDOMAIN'),
          customDomain: null,
        };
  }

  private captureException(err: Error | CustomException, workspaceId?: string) {
    if (err instanceof AuthException) return;

    this.exceptionHandlerService.captureExceptions([err], {
      workspace: {
        id: workspaceId,
      },
    });
  }

  getRedirectErrorUrlAndCaptureExceptions(
    err: Error | CustomException,
    workspace: {
      id?: string;
      subdomain: string;
      customDomain: string | null;
      isCustomDomainEnabled?: boolean;
    },
  ) {
    this.captureException(err, workspace.id);

    return this.domainManagerService.computeRedirectErrorUrl(
      err instanceof AuthException ? err.message : 'Unknown error',
      {
        subdomain: workspace.subdomain,
        customDomain: workspace.customDomain,
        isCustomDomainEnabled: workspace.isCustomDomainEnabled ?? false,
      },
    );
  }
}
