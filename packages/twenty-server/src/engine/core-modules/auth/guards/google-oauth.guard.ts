import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { GuardErrorManagerService } from 'src/engine/core-modules/guard-manager/services/guard-error-manager.service';

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {
  constructor(
    private readonly guardErrorManagerService: GuardErrorManagerService,
  ) {
    super({
      prompt: 'select_account',
    });
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    try {
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

      if (
        request.query.workspaceId &&
        typeof request.query.workspaceId === 'string'
      ) {
        request.params.workspaceId = request.query.workspaceId;
      }

      if (
        request.query.billingCheckoutSessionState &&
        typeof request.query.billingCheckoutSessionState === 'string'
      ) {
        request.params.billingCheckoutSessionState =
          request.query.billingCheckoutSessionState;
      }

      return (await super.canActivate(context)) as boolean;
    } catch (err) {
      this.guardErrorManagerService.dispatchErrorFromGuard(context, err, {
        baseUrl: request.query?.origin_url,
      });

      return false;
    }
  }
}
