import { z } from 'zod';

import { inventoryEnvironmentSchema } from './inventoryEnvironmentSchema';
import { inventoryCatalogSchema } from './inventoryCatalogSchema';
import { inventoryCollectionSchema } from './inventoryCollectionSchema';
import { inventoryFindingSchema } from './inventoryFindingSchema';
import { compareInventoryCollections } from '../utils/compareInventoryCollections';

export const inventoryReportSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    stage: z.literal('inventory'),
    complete: z.literal(true),
    metadata: inventoryEnvironmentSchema,
    catalog: inventoryCatalogSchema,
    reference: inventoryCollectionSchema,
    sandboxes: z.strictObject({
      react: inventoryCollectionSchema,
      preact: inventoryCollectionSchema,
    }),
    findings: z.array(inventoryFindingSchema).min(1),
  })
  .superRefine((report, context) => {
    try {
      const expected = (['react', 'preact'] as const).flatMap((runtime) =>
        compareInventoryCollections({
          catalog: report.catalog,
          reference: report.reference,
          sandbox: report.sandboxes[runtime],
          runtime,
        }),
      );
      if (JSON.stringify(expected) !== JSON.stringify(report.findings)) {
        context.addIssue({
          code: 'custom',
          message: 'Incomplete or inconsistent findings',
        });
      }
    } catch (error) {
      context.addIssue({ code: 'custom', message: String(error) });
    }
  });
