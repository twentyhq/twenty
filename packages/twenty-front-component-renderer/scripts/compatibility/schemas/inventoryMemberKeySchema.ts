import { z } from 'zod';

export const inventoryMemberKeySchema = z.strictObject({
  kind: z.enum(['string', 'well-known-symbol', 'registered-symbol']),
  name: z.string(),
});
