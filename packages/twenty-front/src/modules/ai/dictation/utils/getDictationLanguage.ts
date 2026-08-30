import { isNonEmptyString } from '@sniptt/guards';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

// Only the on-device engine needs this: the Web Speech API recognises exactly
// one language per session and cannot detect it, so a wrong guess produces
// confident nonsense rather than an error. The speaker's Twenty language beats
// navigator.language, which is the browser UI's rather than the speaker's.
export const getDictationLanguage = (
  workspaceMemberLocale?: string | null,
): string => {
  if (
    !isNonEmptyString(workspaceMemberLocale) ||
    workspaceMemberLocale.startsWith('pseudo-')
  ) {
    return SOURCE_LOCALE;
  }

  return workspaceMemberLocale;
};
