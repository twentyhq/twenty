import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class MicrosoftOAuthGuard extends AuthGuard('microsoft') {
  constructor() {
    super({
      prompt: 'select_account',
    });
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const workspaceInviteHash = request.query.inviteHash;

    if (workspaceInviteHash && typeof workspaceInviteHash === 'string') {
      request.params.workspaceInviteHash = workspaceInviteHash;
    }

    return (await super.canActivate(context)) as boolean;
  }
}
