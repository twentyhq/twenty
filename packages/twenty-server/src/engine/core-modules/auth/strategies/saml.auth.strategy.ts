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
  constructor(private readonly ssoService: SSOService) {
    super(
      {
        getSamlOptions: (req, callback) => {
          this.ssoService
            .findSSOIdentityProviderById(req.params.identityProviderId)
            .then((identityProvider) => {
              if (
                identityProvider &&
                this.ssoService.isSAMLIdentityProvider(identityProvider)
              ) {
                // IdP metadata XML typically has whitespace-formatted certificates
                const sanitizedCertificate =
                  identityProvider.certificate.replace(/\s/g, '');

                const config: SamlConfig = {
                  entryPoint: identityProvider.ssoURL,
                  issuer: this.ssoService.buildIssuerURL(identityProvider),
                  callbackUrl:
                    this.ssoService.buildCallbackUrl(identityProvider),
                  idpCert: sanitizedCertificate,
                  wantAssertionsSigned: true,
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
    const workspaceInviteHash = req.query.workspaceInviteHash;

    super.authenticate(req, {
      ...options,
      ...(typeof workspaceInviteHash === 'string'
        ? {
            additionalParams: {
              RelayState: JSON.stringify({ workspaceInviteHash }),
            },
          }
        : {}),
    });
  }

  // RelayState is an unsigned, attacker-shapeable form field. It must never
  // carry the identity-provider id (that lives in the ACS URL path and is what
  // selects the cert that verifies the SAML signature). The only legitimate
  // payload here is `workspaceInviteHash`, which is an SP-side query param
  // that has no other way to survive the IdP round-trip.
  private extractWorkspaceInviteHash(req: Request): string | undefined {
    if (
      !('RelayState' in req.body) ||
      typeof req.body.RelayState !== 'string'
    ) {
      return undefined;
    }

    try {
      const parsed: unknown = JSON.parse(req.body.RelayState);

      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'workspaceInviteHash' in parsed &&
        typeof (parsed as { workspaceInviteHash: unknown })
          .workspaceInviteHash === 'string'
      ) {
        return (parsed as { workspaceInviteHash: string }).workspaceInviteHash;
      }

      return undefined;
    } catch {
      return undefined;
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

      // `identityProviderId` is sourced exclusively from the URL path. That
      // value is what `getSamlOptions` used to pick the IdP cert that just
      // verified this assertion, so it is the only identifier cryptographically
      // bound to the signed payload. Reading it from RelayState would let an
      // attacker route an assertion signed by IdP A into IdP B's workspace.
      done(null, {
        identityProviderId: request.params.identityProviderId,
        workspaceInviteHash: this.extractWorkspaceInviteHash(request),
        email,
      });
    } catch (err) {
      done(err);
    }
  };
}
