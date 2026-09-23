import { isNonEmptyArray, isUndefined } from '@sniptt/guards';
import { type z } from 'zod';

import { INVENTORY_COVERAGE_LIMITS } from '../constants/INVENTORY_COVERAGE_LIMITS';
import { type inventoryCatalogSchema } from '../schemas/inventoryCatalogSchema';
import { type inventoryCollectionSchema } from '../schemas/inventoryCollectionSchema';
import { type InventoryObjects } from '../types/InventoryObjects';
import { assertInventoryFactoriesCoverCatalog } from './assertInventoryFactoriesCoverCatalog';
import { buildUnavailableInventoryTarget } from './buildUnavailableInventoryTarget';
import { discoverInventoryTargets } from './discoverInventoryTargets';
import { getDistinctWindowValueDisclosures } from './getDistinctWindowValueDisclosures';
import { getInventoryMemberId } from './getInventoryMemberId';
import { getInventoryTargetId } from './getInventoryTargetId';
import { inspectInventoryTarget } from './inspectInventoryTarget';
import { observeUndescribedInventoryMember } from './observeUndescribedInventoryMember';

type InventoryCatalog = z.infer<typeof inventoryCatalogSchema>;
type InventoryCollection = z.infer<typeof inventoryCollectionSchema>;

export const collectInventory = ({
  objects,
  runtime,
  catalog,
}: {
  objects: InventoryObjects;
  runtime: InventoryCollection['runtime'];
  catalog?: InventoryCatalog;
}): { catalog: InventoryCatalog; collection: InventoryCollection } => {
  if (!isUndefined(catalog)) {
    assertInventoryFactoriesCoverCatalog({
      catalog,
      factories: objects.factories,
    });
  }
  const targets: InventoryCollection['targets'] = [];
  const skipped: InventoryCollection['coverage']['skipped'] = [];
  const requests =
    catalog?.targets ??
    discoverInventoryTargets(objects).map((target) => ({
      target,
      keys: undefined,
    }));

  for (const { target, keys } of requests) {
    const targetId = getInventoryTargetId(target);
    const inspected = inspectInventoryTarget({ target, targetId, objects });
    if (inspected.status !== 'collected') {
      targets.push(
        buildUnavailableInventoryTarget({
          target,
          targetId,
          keys,
          status: inspected.status,
          reason: inspected.reason,
        }),
      );
      continue;
    }

    skipped.push(...inspected.inspection.skipped);
    const membersById = new Map(
      inspected.inspection.members.map((member) => [member.id, member]),
    );
    const members =
      keys?.map((key) => {
        const id = getInventoryMemberId({ targetId, key });
        return (
          membersById.get(id) ??
          observeUndescribedInventoryMember({
            value: inspected.value,
            id,
            key,
          })
        );
      }) ?? inspected.inspection.members;
    if (!isNonEmptyArray(members)) {
      skipped.push({ id: targetId, reason: 'No stably identifiable members' });
      continue;
    }
    for (const member of members) {
      const isUnexpandedObject =
        member.observation.shape === 'value' &&
        member.observation.valueType === 'object';
      if (member.observation.shape === 'accessor' || isUnexpandedObject) {
        skipped.push({
          id: member.id,
          reason:
            'Nested object or accessor value not recursively inspected; explicit factory targets are measured separately',
        });
      }
    }
    if (target.kind === 'prototype') {
      skipped.push({
        id: targetId,
        reason:
          'Constructor not invoked; instance coverage is limited to named safe factories',
      });
    }
    targets.push({ target, status: 'collected', reason: null, members });
  }
  skipped.push(...getDistinctWindowValueDisclosures({ objects, targets }));

  return {
    catalog: catalog ?? {
      schemaVersion: 1,
      targets: targets.map(({ target, members }) => ({
        target,
        keys: members.map(({ key }) => key),
      })),
    },
    collection: {
      schemaVersion: 1,
      runtime,
      isGlobalThisWindow: objects.globalThis === objects.window,
      targets,
      coverage: { skipped, limits: [...INVENTORY_COVERAGE_LIMITS] },
    },
  };
};
