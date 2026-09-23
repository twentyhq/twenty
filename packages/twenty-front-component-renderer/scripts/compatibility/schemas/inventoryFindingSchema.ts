import { z } from 'zod';

import { inventoryMemberFindingSchema } from './inventoryMemberFindingSchema';
import { inventoryTargetFindingSchema } from './inventoryTargetFindingSchema';

export const inventoryFindingSchema = z.discriminatedUnion('scope', [
  inventoryTargetFindingSchema,
  inventoryMemberFindingSchema,
]);
