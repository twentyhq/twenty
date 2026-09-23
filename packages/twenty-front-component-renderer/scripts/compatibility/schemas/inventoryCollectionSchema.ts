import { z } from 'zod';

import { inventoryMemberSchema } from './inventoryMemberSchema';
import { inventorySandboxRuntimeSchema } from './inventorySandboxRuntimeSchema';
import { inventoryTargetSchema } from './inventoryTargetSchema';

const inventoryTargetMembersSchema = z.array(inventoryMemberSchema).min(1);

export const inventoryCollectionSchema = z.strictObject({
  schemaVersion: z.literal(1),
  runtime: z.enum(['reference', ...inventorySandboxRuntimeSchema.options]),
  isGlobalThisWindow: z.boolean(),
  targets: z
    .array(
      z.discriminatedUnion('status', [
        z.strictObject({
          target: inventoryTargetSchema,
          status: z.literal('collected'),
          reason: z.null(),
          members: inventoryTargetMembersSchema,
        }),
        z.strictObject({
          target: inventoryTargetSchema,
          status: z.enum(['missing', 'uninspectable']),
          reason: z.string().min(1),
          members: inventoryTargetMembersSchema,
        }),
      ]),
    )
    .min(1),
  coverage: z.strictObject({
    skipped: z.array(
      z.strictObject({ id: z.string().min(1), reason: z.string().min(1) }),
    ),
    limits: z.array(z.string().min(1)).min(1),
  }),
});
