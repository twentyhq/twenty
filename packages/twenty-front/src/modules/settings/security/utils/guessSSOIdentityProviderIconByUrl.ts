import {
  type IconComponent,
  IconGoogle,
  IconKey,
  IconMicrosoftOutlook,
} from 'twenty-ui/display';
export const guessSSOIdentityProviderIconByUrl = (
  url: string,
): IconComponent => {
  if (url.includes('google')) {
    return IconGoogle;
  }

  if (url.includes('microsoft')) {
    return IconMicrosoftOutlook;
  }

  return IconKey;
};
