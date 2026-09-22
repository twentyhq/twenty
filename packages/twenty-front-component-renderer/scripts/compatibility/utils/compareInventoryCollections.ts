import { isUndefined } from '@sniptt/guards';
import { type z } from 'zod';

import { inventoryFindingSchema } from '../schemas/inventoryFindingSchema';
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
      const isShapeDifferent =
        observation.shape !== expected.shape ||
        (observation.shape === 'accessor' &&
          expected.shape === 'accessor' &&
          (observation.getter !== expected.getter ||
            observation.setter !== expected.setter)) ||
        (observation.shape === 'value' &&
          expected.shape === 'value' &&
          observation.valueType !== expected.valueType);
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
        observation:
          expected.shape === 'uninspectable'
            ? 'uninspectable'
            : observation.shape === 'missing' ||
                observation.shape === 'uninspectable'
              ? observation.shape
              : isShapeDifferent
                ? 'shape-mismatch'
                : 'present-behavior-unverified',
        behavior: 'unverified',
        isPlacementDifferent:
          hasPlacement && observation.depth !== expected.depth,
        isDescriptorDifferent,
      });
    }),
  );
};
