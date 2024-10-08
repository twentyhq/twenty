import { IconComponent, IconGoogle, IconKey } from 'twenty-ui';

export const gessIconByUrl = (url: string): IconComponent => {
  if (url.includes('google')) {
    return IconGoogle;
  }

  return IconKey;
};
