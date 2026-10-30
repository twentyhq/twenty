import { i18n } from '../i18n';

export const getMeetingUrl = (value: string): string => {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error(i18n._('Meeting links must use HTTPS.'));
  }
  return url.href;
};
