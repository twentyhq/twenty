/* @license Enterprise */

import { z } from 'zod';

export const SsoIdentitiesProvidersOidcParamsSchema = z
  .object({
    type: z.literal('Oidc'),
    clientId: z.string().nonempty(),
    clientSecret: z.string().nonempty(),
  })
  .required();

export const SsoIdentitiesProvidersSamlParamsSchema = z
  .object({
    type: z.literal('Saml'),
    id: z.string().nonempty(),
    ssoUrl: z.url().nonempty(),
    certificate: z.string().nonempty(),
  })
  .required();

export const SsoIdentitiesProvidersParamsSchema = z
  .discriminatedUnion('type', [
    SsoIdentitiesProvidersOidcParamsSchema,
    SsoIdentitiesProvidersSamlParamsSchema,
  ])
  .and(
    z
      .object({
        name: z.string().nonempty(),
        issuer: z.url().nonempty(),
      })
      .required(),
  );
