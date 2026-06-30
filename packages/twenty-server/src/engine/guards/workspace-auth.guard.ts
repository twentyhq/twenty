import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { type Observable } from 'rxjs';

import { getRequest } from 'src/utils/extract-request';

@Injectable()
export class WorkspaceAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = getRequest(context);

    if (!request) {
      return false;
    }

    if (!request.workspace) {
      return false;
    }

    return true;
  }
}
