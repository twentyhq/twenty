import { isNull, isUndefined } from '@sniptt/guards';
import { type z } from 'zod';

import { inventoryCatalogSchema } from '../schemas/inventoryCatalogSchema';
import { inventoryCollectionSchema } from '../schemas/inventoryCollectionSchema';
import { getInventoryTargetId } from './getInventoryTargetId';
import { getInventoryMemberId } from './getInventoryMemberId';

export const validateInventoryCollection = ({
  catalog: catalogInput,
  collection: collectionInput,
  runtime,
}: {
  catalog: unknown;
  collection: unknown;
  runtime: z.infer<typeof inventoryCollectionSchema>['runtime'];
}) => {
  const catalog = inventoryCatalogSchema.parse(catalogInput);
  const collection = inventoryCollectionSchema.parse(collectionInput);
  if (
    collection.runtime !== runtime ||
    collection.targets.length !== catalog.targets.length
  ) {
    throw new Error(`Incomplete or incorrectly labelled ${runtime} collection`);
  }
  const expectedTargets = new Map(
    catalog.targets.map((request) => [
      getInventoryTargetId(request.target),
      request,
    ]),
  );
  const seenTargets = new Set<string>();
  for (const result of collection.targets) {
    const targetId = getInventoryTargetId(result.target);
    const expected = expectedTargets.get(targetId);
    if (
      isUndefined(expected) ||
      seenTargets.has(targetId) ||
      JSON.stringify(expected.target) !== JSON.stringify(result.target)
    ) {
      throw new Error(`Unexpected or duplicate target: ${targetId}`);
    }
    seenTargets.add(targetId);
    if ((result.status === 'collected') !== isNull(result.reason)) {
      throw new Error(`Inconsistent target reason: ${targetId}`);
    }
    const expectedIds = new Set(
      expected.keys.map((key) => getInventoryMemberId({ targetId, key })),
    );
    const seenMembers = new Set<string>();
    for (const member of result.members) {
      const id = getInventoryMemberId({ targetId, key: member.key });
      if (id !== member.id || !expectedIds.has(id) || seenMembers.has(id)) {
        throw new Error(`Unexpected or duplicate member: ${member.id}`);
      }
      seenMembers.add(id);
      if (
        result.status !== 'collected' &&
        member.observation.shape !== result.status
      ) {
        throw new Error(`Inconsistent target and member status: ${id}`);
      }
      if (runtime === 'reference' && member.observation.shape === 'missing') {
        throw new Error(`Invalid reference observation: ${id}`);
      }
    }
    if (seenMembers.size !== expectedIds.size) {
      throw new Error(`Incomplete member collection: ${targetId}`);
    }
  }
  return collection;
};
