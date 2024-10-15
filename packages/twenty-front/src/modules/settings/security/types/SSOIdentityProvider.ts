import { IdpType, SsoIdentityProviderStatus } from '~/generated/graphql';
import { z } from 'zod';
import { SSOIdentitiesProvidersParamsSchema } from '@/settings/security/schemas/SSOIdentityProviderSchema';

export type SSOIdentityProvider = {
  __typename: 'SSOIdentityProvider';
  id: string;
  type: IdpType;
  issuer: string;
  name?: string | null;
  status: SsoIdentityProviderStatus;
};

export type SettingSecurityNewSSOIdentityFormValues = z.infer<
  typeof SSOIdentitiesProvidersParamsSchema
>;
