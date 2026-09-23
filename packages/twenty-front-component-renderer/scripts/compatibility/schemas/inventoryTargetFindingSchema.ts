import { z } from 'zod';

import { inventorySandboxRuntimeSchema } from './inventorySandboxRuntimeSchema';

export const inventoryTargetFindingSchema = z.strictObject({
  scope: z.literal('target'),
  id: z.string().min(1),
  targetId: z.string().min(1),
  runtimes: z.array(inventorySandboxRuntimeSchema).min(1),
  observation: z.enum(['missing', 'uninspectable']),
  reason: z.string().min(1),
  memberCount: z.number().int().positive(),
});
