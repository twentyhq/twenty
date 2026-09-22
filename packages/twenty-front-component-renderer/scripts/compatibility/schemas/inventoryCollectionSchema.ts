import { z } from 'zod';

import { inventoryMemberSchema } from './inventoryMemberSchema';
import { inventoryTargetSchema } from './inventoryTargetSchema';

export const inventoryCollectionSchema = z.strictObject({
  schemaVersion: z.literal(1),
  runtime: z.enum(['reference', 'react', 'preact']),
  globalThisEqualsWindow: z.boolean(),
  targets: z
    .array(
      z.strictObject({
        target: inventoryTargetSchema,
        status: z.enum(['collected', 'missing', 'uninspectable']),
        reason: z.string().min(1).nullable(),
        members: z.array(inventoryMemberSchema).min(1),
      }),
    )
    .min(1),
  coverage: z.strictObject({
    skipped: z.array(
      z.strictObject({ id: z.string().min(1), reason: z.string().min(1) }),
    ),
    limits: z.array(z.string().min(1)).min(1),
  }),
});
