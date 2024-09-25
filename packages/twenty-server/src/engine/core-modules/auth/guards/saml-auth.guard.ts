import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { SamlAuthStrategy } from 'src/engine/core-modules/auth/strategies/saml.auth.strategy';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';

@Injectable()
export class SAMLAuthGuard extends AuthGuard('saml') {
  constructor(private readonly sSOService: SSOService) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const RelayState =
      'RelayState' in request.body ? JSON.parse(request.body.RelayState) : {};

    request.params.idpId = request.params.idpId ?? RelayState.idpId;

    if (request.query.inviteHash || RelayState.inviteHash) {
      request.params.workspaceInviteHash =
        request.query.inviteHash ?? RelayState.inviteHash;
    }

    if (request.query.inviteToken || RelayState.inviteToken) {
      request.params.workspacePersonalInviteToken =
        request.query.inviteToken ?? RelayState.inviteToken;
    }

    if (!request.params.idpId) {
      // TODO: improve error management
      throw new Error('Invalid SAML identity provider');
    }

    new SamlAuthStrategy(this.sSOService);

    try {
      return (await super.canActivate(context)) as boolean;
    } catch (err) {
      console.log('>>>>>>>>>>>>>>', err);
      return false;
    }
  }
}
