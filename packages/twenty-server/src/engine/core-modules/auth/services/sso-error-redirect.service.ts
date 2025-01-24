import { Injectable } from '@nestjs/common';

import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { CustomException } from 'src/utils/custom-exception';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class SsoErrorRedirectService {
  constructor(
    private readonly domainManagerService: DomainManagerService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

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
      err.message && err.message.length !== 0 ? err.message : 'Unknown error',
      workspace.subdomain,
    );
  }
}
