import { z } from 'zod';

export const inventoryFindingSchema = z.strictObject({
  id: z.string().min(1),
  targetId: z.string().min(1),
  runtime: z.enum(['react', 'preact']),
  observation: z.enum([
    'missing',
    'shape-mismatch',
    'present-behavior-unverified',
    'uninspectable',
  ]),
  behavior: z.literal('unverified'),
  placementDiffers: z.boolean(),
  descriptorDiffers: z.boolean(),
});
