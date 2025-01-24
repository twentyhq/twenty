import { ExecutionContext, Injectable } from '@nestjs/common';

import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { CustomException } from 'src/utils/custom-exception';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';

@Injectable()
export class GuardRedirectService {
  constructor(
    private readonly domainManagerService: DomainManagerService,
    private readonly environmentService: EnvironmentService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  dispatchErrorFromGuard(
    context: any,
    error: any,
    workspace: { id?: string; subdomain: string },
  ) {
    if ('contextType' in context && context.contextType === 'graphql') {
      throw error;
    }

    context
      .switchToHttp()
      .getResponse()
      .redirect(this.getRedirectErrorUrlAndCaptureExceptions(error, workspace));
  }

  getSubdomainFromContext(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const subdomainFromUrl =
      this.domainManagerService.getWorkspaceSubdomainFromUrl(
        request.headers.referer,
      );

    return subdomainFromUrl ?? this.environmentService.get('DEFAULT_SUBDOMAIN');
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
    workspace: { id?: string; subdomain: string },
  ) {
    this.captureException(err, workspace.id);

    return this.domainManagerService.computeRedirectErrorUrl(
      err instanceof AuthException ? err.message : 'Unknown error',
      workspace.subdomain,
    );
  }
}
