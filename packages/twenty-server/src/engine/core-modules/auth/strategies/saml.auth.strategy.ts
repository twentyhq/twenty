/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import {
  MultiSamlStrategy,
  MultiStrategyConfig,
  PassportSamlConfig,
  SamlConfig,
  VerifyWithRequest,
} from '@node-saml/passport-saml';
import { AuthenticateOptions } from '@node-saml/passport-saml/lib/types';
import { isEmail } from 'class-validator';
import { Request } from 'express';

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
          .findSSOIdentityProviderById(req.params.identityProviderId)
          .then((identityProvider) => {
            if (
              identityProvider &&
              this.sSOService.isSAMLIdentityProvider(identityProvider)
            ) {
              const config: SamlConfig = {
                entryPoint: identityProvider.ssoURL,
                issuer: this.sSOService.buildIssuerURL(identityProvider),
                callbackUrl: this.sSOService.buildCallbackUrl(identityProvider),
                idpCert: identityProvider.certificate,
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
          identityProviderId: req.params.identityProviderId,
        }),
      },
    });
  }

  validate: VerifyWithRequest = async (request, profile, done) => {
    try {
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

        result.identityProviderId = RelayState.identityProviderId;
      }

      done(null, result);
    } catch (err) {
      done(err);
    }
  };
}
