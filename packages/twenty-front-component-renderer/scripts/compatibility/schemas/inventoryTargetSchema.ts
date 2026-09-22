import { z } from 'zod';

export const inventoryTargetSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal('global'),
    surface: z.enum(['globalThis', 'window']),
  }),
  z.strictObject({
    kind: z.enum(['static', 'prototype', 'namespace']),
    surface: z.enum(['globalThis', 'window']),
    name: z.string().min(1),
  }),
  z.strictObject({ kind: z.literal('factory'), name: z.string().min(1) }),
]);
