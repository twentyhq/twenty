/**
 * @license
 * Enterprise License
 */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { isEmail } from 'class-validator';
import {
  SamlConfig,
  MultiSamlStrategy,
  PassportSamlConfig,
  MultiStrategyConfig,
  VerifyWithRequest,
} from '@node-saml/passport-saml';
import { Request } from 'express';
import { AuthenticateOptions } from '@node-saml/passport-saml/lib/types';

import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';

@Injectable()
export class SamlAuthStrategy extends PassportStrategy(
  MultiSamlStrategy,
  'saml',
) {
  constructor(private readonly sSOService: SSOService) {
    super({
      getSamlOptions: (req, callback) => {
        this.sSOService
          .findSSOIdentityProviderById(req.params.idpId)
          .then((idp) => {
            if (idp && this.sSOService.isSAMLIdentityProvider(idp)) {
              const config: SamlConfig = {
                entryPoint: idp.ssoURL,
                issuer: this.sSOService.buildIssuerURL(idp),
                callbackUrl: this.sSOService.buildCallbackUrl(idp),
                idpCert: idp.certificate,
                wantAssertionsSigned: false,
                // TODO: Improve the feature by sign the response
                wantAuthnResponseSigned: false,
                signatureAlgorithm: 'sha256',
              };

              return callback(null, config);
            }

            // TODO: improve error management
            return callback(new Error('Invalid SAML identity provider'));
          })
          .catch((err) => {
            // TODO: improve error management
            return callback(err);
          });
      },
      passReqToCallback: true,
    } as PassportSamlConfig & MultiStrategyConfig);
  }

  authenticate(req: Request, options: AuthenticateOptions) {
    super.authenticate(req, {
      ...options,
      additionalParams: {
        RelayState: JSON.stringify({
          idpId: req.params.idpId,
          ...(req.params.workspaceInviteHash
            ? { workspaceInviteHash: req.params.workspaceInviteHash }
            : {}),
          ...(req.params.workspacePersonalInviteToken
            ? {
                workspacePersonalInviteToken:
                  req.params.workspacePersonalInviteToken,
              }
            : {}),
        }),
      },
    });
  }

  validate: VerifyWithRequest = async (request, profile, done) => {
    if (!profile) {
      return done(new Error('Profile is must be provided'));
    }

    const email = profile.email ?? profile.mail ?? profile.nameID;

    if (!isEmail(email)) {
      return done(new Error('Invalid email'));
    }

    const result: {
      user: Record<string, string>;
      identityProviderId?: string;
    } = { user: { email } };

    if (
      'RelayState' in request.body &&
      typeof request.body.RelayState === 'string'
    ) {
      const RelayState = JSON.parse(request.body.RelayState);

      result.identityProviderId = RelayState.idpId;
    }

    done(null, result);
  };
}
