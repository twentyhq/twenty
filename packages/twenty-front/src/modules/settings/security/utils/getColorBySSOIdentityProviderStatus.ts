import { SsoIdentityProviderStatus } from '~/generated/graphql';
import { ThemeColor } from 'twenty-ui/theme';

export const getColorBySSOIdentityProviderStatus: Record<
  SsoIdentityProviderStatus,
  ThemeColor
> = {
  Active: 'green',
  Inactive: 'gray',
  Error: 'red',
};
