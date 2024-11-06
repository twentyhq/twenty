/* @license Enterprise */

import { z } from 'zod';

export const SSOIdentitiesProvidersOIDCParamsSchema = z
  .object({
    type: z.literal('OIDC'),
    clientID: z.string().optional(),
    clientSecret: z.string().optional(),
  })
  .required();

export const SSOIdentitiesProvidersSAMLParamsSchema = z
  .object({
    type: z.literal('SAML'),
    id: z.string().optional(),
    ssoURL: z.string().url().optional(),
    certificate: z.string().optional(),
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
        name: z.string().min(1),
        issuer: z.string().url().optional(),
      })
      .required(),
  );
