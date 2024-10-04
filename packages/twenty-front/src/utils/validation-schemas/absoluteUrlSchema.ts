import { z } from 'zod';

export const absoluteUrlSchema = z
  .string()
  .url()
  .or(
    z
      .string()
      .transform((value) => {
        try {
          const url = `https://${value}`.trim();
          return isNaN(Number(value.trim())) &&
            new URL(url) &&
            /\.[a-z]{2,}$/.test(url)
            ? url
            : '';
        } catch {
          return '';
        }
      })
      .pipe(z.string().url()),
  )
  .or(z.literal(''));
