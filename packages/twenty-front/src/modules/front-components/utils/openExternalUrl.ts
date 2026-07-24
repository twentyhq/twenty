import { isNonEmptyString } from '@sniptt/guards';

export const openExternalUrl = (url: string, target?: string) => {
  window.open(
    url,
    isNonEmptyString(target) ? target : '_self',
    'noopener,noreferrer',
  );
};
