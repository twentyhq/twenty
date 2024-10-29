/* @license Enterprise */

import { SSOIdentitiesProvidersParamsSchema } from '@/settings/security/validation-schemas/SSOIdentityProviderSchema';
import { z } from 'zod';
import {
  IdentityProviderType,
  SsoIdentityProviderStatus,
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
