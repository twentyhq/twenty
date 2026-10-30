import { z } from 'zod';
import { t } from '@lingui/core/macro';

export const simpleQuotesStringSchema = z
  .string()
  .refine(
    (value: string): value is `'${string}'` =>
      value.startsWith("'") && value.endsWith("'"),
    {
      error: () => t`String should be wrapped in simple quotes`,
    },
  );
