import { IdpType } from '~/generated/graphql';

export type SSOIdentityProvider = {
  __typename: 'SSOIdentityProvider';
  id: string;
  type: IdpType;
  issuer: string;
  name?: string | null;
};
