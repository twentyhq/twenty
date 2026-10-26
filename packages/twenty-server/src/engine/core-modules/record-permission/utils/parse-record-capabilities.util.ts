import { type RecordCapabilities } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

export const parseRecordCapabilities = (
  value: unknown,
): RecordCapabilities | null => {
  if (!isDefined(value)) return null;
  return z
    .object({
      read: z.boolean().optional(),
      update: z.boolean().optional(),
      softDelete: z.boolean().optional(),
      destroy: z.boolean().optional(),
      share: z.boolean().optional(),
      receive: z.boolean().optional(),
      create: z.boolean().optional(),
      restore: z.boolean().optional(),
    })
    .strict()
    .parse(value);
};
