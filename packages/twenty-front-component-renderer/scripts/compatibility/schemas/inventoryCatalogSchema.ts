import { z } from 'zod';

import { inventoryMemberKeySchema } from './inventoryMemberKeySchema';
import { inventoryTargetSchema } from './inventoryTargetSchema';
import { getInventoryTargetId } from '../utils/getInventoryTargetId';
import { getInventoryMemberId } from '../utils/getInventoryMemberId';

export const inventoryCatalogSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    targets: z
      .array(
        z.strictObject({
          target: inventoryTargetSchema,
          keys: z.array(inventoryMemberKeySchema).min(1),
        }),
      )
      .min(1),
  })
  .superRefine(({ targets }, context) => {
    const targetIds = targets.map(({ target }) => getInventoryTargetId(target));
    const featureIds = targets.flatMap(({ target, keys }) =>
      keys.map((key) =>
        getInventoryMemberId({ targetId: getInventoryTargetId(target), key }),
      ),
    );
    if (
      new Set(targetIds).size !== targetIds.length ||
      new Set(featureIds).size !== featureIds.length
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Duplicate target or feature identifiers',
      });
    }
    for (const required of [
      'globalThis',
      'window',
      'instance:rendered.div',
      'instance:rendered.svg',
    ]) {
      if (!targetIds.includes(required)) {
        context.addIssue({
          code: 'custom',
          message: `Missing required target: ${required}`,
        });
      }
    }
  });
