import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {
  constructor() {
    super({
      prompt: 'select_account',
    });
  }

  async canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();
      const workspaceInviteHash = request.query.inviteHash;

      if (workspaceInviteHash && typeof workspaceInviteHash === 'string') {
        request.params.workspaceInviteHash = workspaceInviteHash;
      }
      const activate = (await super.canActivate(context)) as boolean;

      return activate;
    } catch (ex) {
      throw ex;
    }
  }
}
