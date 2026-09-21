import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { type Observable } from 'rxjs';

import { getRequestOrThrowWhenUnauthenticated } from 'src/engine/guards/utils/get-request-or-throw-when-unauthenticated.util';

@Injectable()
export class WorkspaceAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = getRequestOrThrowWhenUnauthenticated(context);

    if (!request) {
      return false;
    }

    // Workspace-agnostic token: a genuine refusal, renewing returns the same one.
    if (!request.workspace) {
      return false;
    }

    return true;
  }
}
