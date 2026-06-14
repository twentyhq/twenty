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
import { z } from 'zod';

import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';

const WORKSPACE_INVITE_HASH_PAYLOAD_SCHEMA = z.object({
  workspaceInviteHash: z.string().optional(),
});

const RELAY_STATE_BODY_SCHEMA = z.object({
  RelayState: z
    .string()
    .transform((raw, ctx) => {
      try {
        return JSON.parse(raw) as unknown;
      } catch {
        ctx.addIssue({
          code: 'custom',
          message: 'RelayState is not valid JSON',
        });

        return z.NEVER;
      }
    })
    .pipe(WORKSPACE_INVITE_HASH_PAYLOAD_SCHEMA),
});

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
    const queryParseResult = WORKSPACE_INVITE_HASH_PAYLOAD_SCHEMA.safeParse(
      req.query,
    );
    const workspaceInviteHash = queryParseResult.success
      ? queryParseResult.data.workspaceInviteHash
      : undefined;

    super.authenticate(req, {
      ...options,
      ...(workspaceInviteHash !== undefined
        ? {
            additionalParams: {
              RelayState: JSON.stringify({ workspaceInviteHash }),
            },
          }
        : {}),
    });
  }

  private extractWorkspaceInviteHash(req: Request): string | undefined {
    const result = RELAY_STATE_BODY_SCHEMA.safeParse(req.body);

    return result.success
      ? result.data.RelayState.workspaceInviteHash
      : undefined;
  }

  validate: VerifyWithRequest = async (request, profile, done) => {
    try {
      if (!profile) {
        return done(new Error('Profile must be provided'));
      }

      const email = profile.email ?? profile.mail ?? profile.nameID;

      if (!isEmail(email)) {
        return done(new Error('Invalid email'));
      }

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
