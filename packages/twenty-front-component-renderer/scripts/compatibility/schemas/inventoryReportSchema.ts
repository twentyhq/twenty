import { z } from 'zod';

import { inventoryEnvironmentSchema } from './inventoryEnvironmentSchema';
import { inventoryCatalogSchema } from './inventoryCatalogSchema';
import { inventoryCollectionSchema } from './inventoryCollectionSchema';
import { inventoryFindingSchema } from './inventoryFindingSchema';
import { inventorySandboxRuntimeSchema } from './inventorySandboxRuntimeSchema';

export const inventoryReportSchema = z.strictObject({
  schemaVersion: z.literal(1),
  stage: z.literal('inventory'),
  complete: z.literal(true),
  metadata: inventoryEnvironmentSchema,
  catalog: inventoryCatalogSchema,
  reference: inventoryCollectionSchema,
  sandboxes: z.record(inventorySandboxRuntimeSchema, inventoryCollectionSchema),
  findings: z.array(inventoryFindingSchema).min(1),
});
