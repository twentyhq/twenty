import { IdpType } from '~/generated/graphql';
import { z } from 'zod';
import { SSOIdentitiesProvidersParamsSchema } from '@/settings/security/utils/SSOIdentityProviderSchema';

export type SSOIdentityProvider = {
  __typename: 'SSOIdentityProvider';
  id: string;
  type: IdpType;
  issuer: string;
  name?: string | null;
};

export type SettingSecurityNewSSOIdentityFormValues = z.infer<
  typeof SSOIdentitiesProvidersParamsSchema
>;
