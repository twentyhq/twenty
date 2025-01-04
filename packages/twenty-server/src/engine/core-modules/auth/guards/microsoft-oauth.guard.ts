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

    if (
      request.query.workspaceSubdomain &&
      typeof request.query.workspaceSubdomain === 'string'
    ) {
      request.params.workspaceSubdomain = request.query.workspaceSubdomain;
    }

    if (
      request.query.billingCheckoutSessionState &&
      typeof request.query.billingCheckoutSessionState === 'string'
    ) {
      request.params.billingCheckoutSessionState =
        request.query.billingCheckoutSessionState;
    }

    return (await super.canActivate(context)) as boolean;
  }
}
