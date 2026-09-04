/* @license Enterprise */

import { z } from 'zod';

export const ssoIdentitiesProvidersOidcParamsSchema = z
  .object({
    type: z.literal('OIDC'),
    clientID: z.string().nonempty(),
    clientSecret: z.string().nonempty(),
  })
  .required();

export const ssoIdentitiesProvidersSamlParamsSchema = z
  .object({
    type: z.literal('SAML'),
    id: z.string().nonempty(),
    ssoURL: z.url().nonempty(),
    certificate: z.string().nonempty(),
  })
  .required();

export const ssoIdentitiesProvidersParamsSchema = z
  .discriminatedUnion('type', [
    ssoIdentitiesProvidersOidcParamsSchema,
    ssoIdentitiesProvidersSamlParamsSchema,
  ])
  .and(
    z
      .object({
        name: z.string().nonempty(),
        issuer: z.url().nonempty(),
      })
      .required(),
  );
