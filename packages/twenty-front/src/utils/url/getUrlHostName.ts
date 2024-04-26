import { absoluteUrlSchema } from '~/utils/validation-schemas/absoluteUrlSchema';

export const getUrlHostName = (url: string) => {
  try {
    const absoluteUrl = absoluteUrlSchema.parse(url);
    return new URL(absoluteUrl).hostname.replace(/^www\./i, '');
  } catch {
    return '';
  }
};
