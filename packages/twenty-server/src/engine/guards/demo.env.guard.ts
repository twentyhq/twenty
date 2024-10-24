import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { Observable } from 'rxjs';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class DemoEnvGuard implements CanActivate {
  constructor(private readonly environmentService: EnvironmentService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    const demoWorkspaceIds = this.environmentService.get('DEMO_WORKSPACE_IDS');
    const currentUserWorkspaceId = request.workspace?.id;

    if (!currentUserWorkspaceId) {
      throw new UnauthorizedException('Unauthorized for not logged in user');
    }

    if (demoWorkspaceIds.includes(currentUserWorkspaceId)) {
      throw new UnauthorizedException('Unauthorized for demo workspace');
    }

    return true;
  }
}
