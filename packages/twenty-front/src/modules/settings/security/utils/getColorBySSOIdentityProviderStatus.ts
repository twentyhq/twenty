/* @license Enterprise */

import { ThemeColor } from 'twenty-ui';
import { SsoIdentityProviderStatus } from '~/generated/graphql';

export const getColorBySSOIdentityProviderStatus: Record<
  SsoIdentityProviderStatus,
  ThemeColor
> = {
  Active: 'green',
  Inactive: 'gray',
  Error: 'red',
};
