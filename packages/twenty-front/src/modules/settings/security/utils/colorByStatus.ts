import { ThemeColor } from 'twenty-ui';
import { SsoIdentityProviderStatus } from '~/generated/graphql';

export const colorByStatus: Record<SsoIdentityProviderStatus, ThemeColor> = {
  Active: 'green',
  Inactive: 'gray',
  Error: 'red',
};
