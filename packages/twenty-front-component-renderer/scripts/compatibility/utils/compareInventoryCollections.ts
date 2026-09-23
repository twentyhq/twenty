import { isUndefined } from '@sniptt/guards';
import { type z } from 'zod';

import { type inventoryCollectionSchema } from '../schemas/inventoryCollectionSchema';
import { type inventoryFindingSchema } from '../schemas/inventoryFindingSchema';
import { type InventorySandboxRuntime } from '../types/InventorySandboxRuntime';
import { getInventoryFindingObservation } from './getInventoryFindingObservation';
import { getInventoryTargetId } from './getInventoryTargetId';

type InventoryCollection = z.infer<typeof inventoryCollectionSchema>;
type InventoryFinding = z.infer<typeof inventoryFindingSchema>;

export const compareInventoryCollections = ({
  reference,
  sandbox,
  runtime,
}: {
  reference: InventoryCollection;
  sandbox: InventoryCollection;
  runtime: InventorySandboxRuntime;
}): InventoryFinding[] => {
  const expectedMembers = new Map(
    reference.targets.flatMap(({ members }) =>
      members.map((member) => [member.id, member.observation] as const),
    ),
  );

  return sandbox.targets.flatMap((result): InventoryFinding[] => {
    const targetId = getInventoryTargetId(result.target);
    if (result.status !== 'collected') {
      return [
        {
          scope: 'target',
          id: targetId,
          targetId,
          runtimes: [runtime],
          observation: result.status,
          reason: result.reason,
          memberCount: result.members.length,
        },
      ];
    }
    return result.members.map(({ id, observation }): InventoryFinding => {
      const expected = expectedMembers.get(id);
      if (isUndefined(expected)) {
        throw new Error(`Missing reference member: ${id}`);
      }
      const hasPlacement = 'depth' in observation && 'depth' in expected;
      const isDescriptorDifferent =
        hasPlacement &&
        (observation.enumerable !== expected.enumerable ||
          observation.configurable !== expected.configurable ||
          ('writable' in observation &&
            'writable' in expected &&
            observation.writable !== expected.writable));
      return {
        scope: 'member',
        id,
        targetId,
        runtimes: [runtime],
        observation: getInventoryFindingObservation({
          reference: expected,
          sandbox: observation,
        }),
        behavior: 'unverified',
        isPlacementDifferent:
          hasPlacement && observation.depth !== expected.depth,
        isDescriptorDifferent,
      };
    });
  });
};
