import { z } from 'zod';

export const sanitizeLink = (url: string) => {
  const hostname = getUrlHostName(url) || getUrlHostName(`https://${url}`);
  return hostname.replace(/\/+$/, '').replace(/\?.*$/, '');
};

const getUrlHostName = (url: string) => {
  const urlSchema = z.string().url();
  const validation = urlSchema.safeParse(url);

  return validation.success
    ? new URL(validation.data).hostname.replace(/^www\./i, '')
    : '';
};
