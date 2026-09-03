/* @license Enterprise */

import { type ssoIdentitiesProvidersParamsSchema } from '@/settings/security/validation-schemas/ssoIdentityProviderSchema';
import { type z } from 'zod';
import {
  type IdentityProviderType,
  type SsoIdentityProviderStatus,
} from '~/generated-metadata/graphql';

export type SsoIdentityProvider = {
  __typename: 'SSOIdentityProvider';
  id: string;
  type: IdentityProviderType;
  issuer: string;
  name?: string | null;
  status: SsoIdentityProviderStatus;
};

export type SettingSecurityNewSsoIdentityFormValues = z.infer<
  typeof ssoIdentitiesProvidersParamsSchema
>;
