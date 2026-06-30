/* @license Enterprise */

import { z } from 'zod';

export const SSOIdentitiesProvidersOIDCParamsSchema = z
  .object({
    type: z.literal('OIDC'),
    clientID: z.string().nonempty(),
    clientSecret: z.string().nonempty(),
  })
  .required();

export const SSOIdentitiesProvidersSAMLParamsSchema = z
  .object({
    type: z.literal('SAML'),
    id: z.string().nonempty(),
    ssoURL: z.url().nonempty(),
    certificate: z.string().nonempty(),
  })
  .required();

export const SSOIdentitiesProvidersParamsSchema = z
  .discriminatedUnion('type', [
    SSOIdentitiesProvidersOIDCParamsSchema,
    SSOIdentitiesProvidersSAMLParamsSchema,
  ])
  .and(
    z
      .object({
        name: z.string().nonempty(),
        issuer: z.url().nonempty(),
      })
      .required(),
  );
