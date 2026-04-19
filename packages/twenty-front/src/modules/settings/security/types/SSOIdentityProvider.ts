/* @license Enterprise */

import { type SsoIdentitiesProvidersParamsSchema } from '@/settings/security/validation-schemas/SsoIdentityProviderSchema';
import { type z } from 'zod';
import {
  type IdentityProviderType,
  type SsoIdentityProviderStatus,
} from '~/generated-metadata/graphql';

export type SsoIdentityProvider = {
  __typename: 'SsoIdentityProvider';
  id: string;
  type: IdentityProviderType;
  issuer: string;
  name?: string | null;
  status: SsoIdentityProviderStatus;
};

export type SettingSecurityNewSsoIdentityFormValues = z.infer<
  typeof SsoIdentitiesProvidersParamsSchema
>;
