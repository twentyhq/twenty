/* @license Enterprise */

import { IconComponent, IconGoogle, IconKey } from 'twenty-ui';

export const guessSSOIdentityProviderIconByUrl = (
  url: string,
): IconComponent => {
  if (url.includes('google')) {
    return IconGoogle;
  }

  return IconKey;
};
