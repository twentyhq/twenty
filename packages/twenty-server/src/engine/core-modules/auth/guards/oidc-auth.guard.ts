import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OIDCAuthGuard extends AuthGuard('openidconnect') {
  constructor() {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const workspaceInviteHash = request.query.inviteHash;
    const workspacePersonalInviteToken = request.query.inviteToken;

    if (workspaceInviteHash && typeof workspaceInviteHash === 'string') {
      request.params.workspaceInviteHash = workspaceInviteHash;
    }

    if (
      workspacePersonalInviteToken &&
      typeof workspacePersonalInviteToken === 'string'
    ) {
      request.params.workspacePersonalInviteToken =
        workspacePersonalInviteToken;
    }

    return (await super.canActivate(context)) as boolean;
  }
}
