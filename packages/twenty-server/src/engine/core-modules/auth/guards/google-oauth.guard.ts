import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {
  constructor() {
    super({
      prompt: 'select_account',
    });
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const workspaceInviteHash = request.query.inviteHash;
    const workspacePersonalInviteToken = request.query.inviteToken;

    if (request.query.error === 'access_denied') {
      throw new AuthException(
        'Google OAuth access denied',
        AuthExceptionCode.OAUTH_ACCESS_DENIED,
      );
    }

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
