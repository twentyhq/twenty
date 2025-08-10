/* @license Enterprise */

import { type SSOIdentitiesProvidersParamsSchema } from '@/settings/security/validation-schemas/SSOIdentityProviderSchema';
import { type z } from 'zod';
import {
  type IdentityProviderType,
  type SsoIdentityProviderStatus,
} from '~/generated/graphql';

export type SSOIdentityProvider = {
  __typename: 'SSOIdentityProvider';
  id: string;
  type: IdentityProviderType;
  issuer: string;
  name?: string | null;
  status: SsoIdentityProviderStatus;
};

export type SettingSecurityNewSSOIdentityFormValues = z.infer<
  typeof SSOIdentitiesProvidersParamsSchema
>;
