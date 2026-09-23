import { z } from 'zod';

import { inventorySandboxRuntimeSchema } from './inventorySandboxRuntimeSchema';

export const inventoryMemberFindingSchema = z.strictObject({
  scope: z.literal('member'),
  id: z.string().min(1),
  targetId: z.string().min(1),
  runtimes: z.array(inventorySandboxRuntimeSchema).min(1),
  observation: z.enum([
    'missing',
    'shape-mismatch',
    'present-behavior-unverified',
    'uninspectable',
  ]),
  behavior: z.literal('unverified'),
  isPlacementDifferent: z.boolean(),
  isDescriptorDifferent: z.boolean(),
});
