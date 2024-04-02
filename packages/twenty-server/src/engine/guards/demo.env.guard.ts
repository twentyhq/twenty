import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { getRequest } from 'src/utils/extract-request';

@Injectable()
export class DemoEnvGuard extends AuthGuard(['jwt']) {
  constructor(private readonly environmentService: EnvironmentService) {
    super();
  }

  getRequest(context: ExecutionContext) {
    return getRequest(context);
  }

  // TODO: input should be typed
  handleRequest(err: any, user: any) {
    const demoWorkspaceIds = this.environmentService.get('DEMO_WORKSPACE_IDS');
    const currentUserWorkspaceId = user?.workspace?.id;

    if (!currentUserWorkspaceId) {
      throw new UnauthorizedException('Unauthorized for not logged in user');
    }

    if (demoWorkspaceIds.includes(currentUserWorkspaceId)) {
      throw new UnauthorizedException('Unauthorized for demo workspace');
    }

    return user;
  }
}
