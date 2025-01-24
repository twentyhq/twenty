import { Injectable } from '@nestjs/common';

import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class SsoErrorRedirectService {
  constructor(
    private readonly domainManagerService: DomainManagerService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  private getErrorMessage(err: any) {
    try {
      return err.message && err.message.length !== 0
        ? err.message
        : 'Unknown error';
    } catch (err) {
      return 'Unknown error';
    }
  }

  private captureExceptions(
    err: any,
    workspace: { id?: string; subdomain: string },
  ) {
    try {
      if (
        !(err instanceof AuthException) ||
        ('code' in err && err.code === 'INTERNAL_SERVER_ERROR')
      ) {
        this.exceptionHandlerService.captureExceptions([err], {
          workspace: {
            id: workspace.id,
          },
        });
      }
    } catch (err) {
      this.exceptionHandlerService.captureExceptions([err]);
    }
  }

  getRedirectErrorUrlAndCaptureExceptions(
    err: any,
    workspace: { id?: string; subdomain: string },
  ) {
    this.captureExceptions(err, workspace);

    return this.domainManagerService.computeRedirectErrorUrl(
      this.getErrorMessage(err),
      workspace.subdomain,
    );
  }
}
