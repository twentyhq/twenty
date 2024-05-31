import { absoluteUrlSchema } from '~/utils/validation-schemas/absoluteUrlSchema';

export const getAbsoluteUrl = (url: string) => {
  try {
    return absoluteUrlSchema.parse(url);
  } catch {
    return '';
  }
};
