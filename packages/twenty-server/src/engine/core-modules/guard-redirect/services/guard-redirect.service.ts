import { ExecutionContext, Injectable } from '@nestjs/common';

import { Request } from 'express';

import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { CustomException } from 'src/utils/custom-exception';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class GuardRedirectService {
  constructor(
    private readonly domainManagerService: DomainManagerService,
    private readonly environmentService: EnvironmentService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  dispatchErrorFromGuard(
    context: ExecutionContext,
    error: Error | CustomException,
    workspace: { id?: string; subdomain: string; customDomain?: string },
  ) {
    if ('contextType' in context && context.contextType === 'graphql') {
      throw error;
    }

    context
      .switchToHttp()
      .getResponse()
      .redirect(this.getRedirectErrorUrlAndCaptureExceptions(error, workspace));
  }

  getSubdomainAndCustomDomainFromWorkspace(
    workspace?: Pick<Workspace, 'subdomain' | 'customDomain'> | null,
  ) {
    if (!workspace) {
      return {
        subdomain: this.environmentService.get('DEFAULT_SUBDOMAIN'),
      };
    }

    return workspace;
  }

  getSubdomainAndCustomDomainFromContext(context: ExecutionContext): {
    subdomain: string;
    customDomain?: string;
  } {
    const request = context.switchToHttp().getRequest<Request>();

    const subdomainAndCustomDomainFromReferer = request.headers.referer
      ? this.domainManagerService.getSubdomainAndCustomDomainFromUrl(
          request.headers.referer,
        )
      : null;

    return {
      subdomain:
        subdomainAndCustomDomainFromReferer?.subdomain ??
        this.environmentService.get('DEFAULT_SUBDOMAIN'),
      customDomain: subdomainAndCustomDomainFromReferer?.customDomain,
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
    workspace: { id?: string; subdomain: string; customDomain?: string },
  ) {
    this.captureException(err, workspace.id);

    return this.domainManagerService.computeRedirectErrorUrl(
      err instanceof AuthException ? err.message : 'Unknown error',
      workspace,
    );
  }
}
