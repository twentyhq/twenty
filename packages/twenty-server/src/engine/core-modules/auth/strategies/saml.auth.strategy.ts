/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import {
  MultiSamlStrategy,
  type MultiStrategyConfig,
  type PassportSamlConfig,
  type SamlConfig,
  type VerifyWithRequest,
} from '@node-saml/passport-saml';
import { type AuthenticateOptions } from '@node-saml/passport-saml/lib/types';
import { isEmail } from 'class-validator';
import { type Request } from 'express';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';

export type SAMLRequest = Omit<
  Request,
  'user' | 'workspace' | 'workspaceMetadataVersion'
> & {
  user: {
    identityProviderId: string;
    workspaceInviteHash?: string;
    email: string;
  };
};

@Injectable()
export class SamlAuthStrategy extends PassportStrategy(
  MultiSamlStrategy,
  'saml',
) {
  constructor(private readonly sSOService: SSOService) {
    super(
      {
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
                  callbackUrl:
                    this.sSOService.buildCallbackUrl(identityProvider),
                  idpCert: identityProvider.certificate,
                  // TODO: Improve the feature by sign the response
                  wantAssertionsSigned: false,
                  wantAuthnResponseSigned: false,
                  disableRequestedAuthnContext: true,
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
      } as PassportSamlConfig & MultiStrategyConfig,
      async (request: Request, profile, done) => {
        await this.validate(request, profile, done);
      },
    );
  }

  authenticate(req: Request, options: AuthenticateOptions) {
    super.authenticate(req, {
      ...options,
      additionalParams: {
        RelayState: JSON.stringify({
          identityProviderId: req.params.identityProviderId,
          ...(req.query.workspaceInviteHash
            ? { workspaceInviteHash: req.query.workspaceInviteHash }
            : {}),
        }),
      },
    });
  }

  private extractState(req: Request): {
    identityProviderId: string;
    workspaceInviteHash?: string;
  } {
    try {
      if ('RelayState' in req.body && typeof req.body.RelayState === 'string') {
        const RelayState = JSON.parse(req.body.RelayState);

        return {
          identityProviderId: RelayState.identityProviderId,
          workspaceInviteHash: RelayState.workspaceInviteHash,
        };
      }

      throw new Error();
    } catch {
      throw new AuthException('Invalid state', AuthExceptionCode.INVALID_INPUT);
    }
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
      const state = this.extractState(request);

      done(null, { ...state, email });
    } catch (err) {
      done(err);
    }
  };
}
