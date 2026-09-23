import { type z } from 'zod';

import { type inventoryTargetSchema } from '../schemas/inventoryTargetSchema';
import { type InventoryObjects } from '../types/InventoryObjects';
import { inspectInventoryObject } from './inspectInventoryObject';
import { resolveInventoryTarget } from './resolveInventoryTarget';

export const inspectInventoryTarget = ({
  target,
  targetId,
  objects,
}: {
  target: z.infer<typeof inventoryTargetSchema>;
  targetId: string;
  objects: InventoryObjects;
}):
  | {
      status: 'collected';
      value: object;
      inspection: ReturnType<typeof inspectInventoryObject>;
    }
  | { status: 'missing' | 'uninspectable'; reason: string } => {
  const resolved = resolveInventoryTarget({ target, objects });
  if (resolved.status !== 'collected') {
    return resolved;
  }
  try {
    return {
      status: 'collected',
      value: resolved.value,
      inspection: inspectInventoryObject({ value: resolved.value, targetId }),
    };
  } catch (error) {
    return { status: 'uninspectable', reason: String(error) };
  }
};
