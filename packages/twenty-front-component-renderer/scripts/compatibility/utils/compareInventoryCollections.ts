import { isUndefined } from '@sniptt/guards';
import { type z } from 'zod';

import { inventoryFindingSchema } from '../schemas/inventoryFindingSchema';
import { getInventoryFindingObservation } from './getInventoryFindingObservation';
import { getInventoryTargetId } from './getInventoryTargetId';
import { validateInventoryCollection } from './validateInventoryCollection';

export const compareInventoryCollections = ({
  catalog,
  reference: referenceInput,
  sandbox: sandboxInput,
  runtime,
}: {
  catalog: unknown;
  reference: unknown;
  sandbox: unknown;
  runtime: 'react' | 'preact';
}): z.infer<typeof inventoryFindingSchema>[] => {
  const reference = validateInventoryCollection({
    catalog,
    collection: referenceInput,
    runtime: 'reference',
  });
  const sandbox = validateInventoryCollection({
    catalog,
    collection: sandboxInput,
    runtime,
  });
  const expectedMembers = new Map(
    reference.targets.flatMap(({ members }) =>
      members.map((member) => [member.id, member.observation] as const),
    ),
  );

  return sandbox.targets.flatMap(({ target, members }) =>
    members.map(({ id, observation }) => {
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
      return inventoryFindingSchema.parse({
        id,
        targetId: getInventoryTargetId(target),
        runtime,
        observation: getInventoryFindingObservation({
          reference: expected,
          sandbox: observation,
        }),
        behavior: 'unverified',
        isPlacementDifferent:
          hasPlacement && observation.depth !== expected.depth,
        isDescriptorDifferent,
      });
    }),
  );
};
