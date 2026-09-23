import { isUndefined } from '@sniptt/guards';
import { type z } from 'zod';

import { type inventoryFindingSchema } from '../schemas/inventoryFindingSchema';

type InventoryFinding = z.infer<typeof inventoryFindingSchema>;

export const mergeInventoryFindings = (
  findings: InventoryFinding[],
): InventoryFinding[] => {
  const mergedFindings = new Map<string, InventoryFinding>();
  for (const finding of findings) {
    const runtimeIndependentKey = JSON.stringify({ ...finding, runtimes: [] });
    const mergedFinding = mergedFindings.get(runtimeIndependentKey);
    if (isUndefined(mergedFinding)) {
      mergedFindings.set(runtimeIndependentKey, {
        ...finding,
        runtimes: [...finding.runtimes],
      });
      continue;
    }
    mergedFinding.runtimes.push(...finding.runtimes);
  }
  return [...mergedFindings.values()];
};
