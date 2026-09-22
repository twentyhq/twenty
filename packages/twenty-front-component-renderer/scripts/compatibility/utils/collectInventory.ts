import { isUndefined, isNonEmptyArray } from '@sniptt/guards';
import { type z } from 'zod';

import { inventoryCatalogSchema } from '../schemas/inventoryCatalogSchema';
import { inventoryCollectionSchema } from '../schemas/inventoryCollectionSchema';
import { type InventoryObjects } from '../types/InventoryObjects';
import { discoverInventoryTargets } from './discoverInventoryTargets';
import { getInventoryTargetId } from './getInventoryTargetId';
import { getInventoryMemberId } from './getInventoryMemberId';
import { inspectInventoryObject } from './inspectInventoryObject';
import { resolveInventoryTarget } from './resolveInventoryTarget';

export const collectInventory = ({
  objects,
  runtime,
  catalog,
}: {
  objects: InventoryObjects;
  runtime: z.infer<typeof inventoryCollectionSchema>['runtime'];
  catalog?: z.infer<typeof inventoryCatalogSchema>;
}) => {
  const targets: z.infer<typeof inventoryCollectionSchema>['targets'] = [];
  const skipped: z.infer<
    typeof inventoryCollectionSchema
  >['coverage']['skipped'] = [];
  const requests =
    catalog?.targets ??
    discoverInventoryTargets(objects).map((target) => ({
      target,
      keys: undefined,
    }));

  for (const { target, keys } of requests) {
    const targetId = getInventoryTargetId(target);
    const resolved = resolveInventoryTarget({ target, objects });
    if (resolved.status !== 'collected') {
      if (isUndefined(keys)) {
        throw new Error(`Reference target ${targetId}: ${resolved.reason}`);
      }
      targets.push({
        target,
        status: resolved.status,
        reason: resolved.reason,
        members: keys.map((key) => ({
          id: getInventoryMemberId({ targetId, key }),
          key,
          observation:
            resolved.status === 'missing'
              ? { shape: 'missing' as const }
              : { shape: 'uninspectable' as const, reason: resolved.reason },
        })),
      });
      continue;
    }

    const inspected = inspectInventoryObject({
      value: resolved.value,
      targetId,
    });
    skipped.push(...inspected.skipped);
    const membersById = new Map(
      inspected.members.map((member) => [member.id, member]),
    );
    const members =
      keys?.map((key) => {
        const id = getInventoryMemberId({ targetId, key });
        return (
          membersById.get(id) ?? {
            id,
            key,
            observation: { shape: 'missing' as const },
          }
        );
      }) ?? inspected.members;
    if (!isNonEmptyArray(members)) {
      skipped.push({ id: targetId, reason: 'No stably identifiable members' });
      continue;
    }
    for (const member of members) {
      const descriptor = inspected.descriptors.get(member.key.name);
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
      if (target.kind === 'prototype' && descriptor?.value === resolved.value) {
        skipped.push({
          id: member.id,
          reason: 'Cyclic object reference not expanded',
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

  const collection = inventoryCollectionSchema.parse({
    schemaVersion: 1,
    runtime,
    isGlobalThisWindow: objects.globalThis === objects.window,
    targets,
    coverage: {
      skipped,
      limits: [
        'Descriptor presence and shape only; all behavior is unverified.',
        'Global names, function statics, exposed prototypes, one level of data namespaces, and explicit safe factories. Nested object graphs are not recursively expanded.',
        'No arbitrary getters or constructors are invoked. Safe factories explicitly read selected browser accessors and create detached DOM nodes and inert platform objects.',
        'Local symbols cannot be matched across realms and are listed as skipped. Well-known and registered symbols retain stable identifiers.',
        'Only the configured Chromium environment is measured. Permissions, hardware, visual CSS, other browsers, and unexposed APIs are outside coverage.',
        'Sandbox-only targets and members are outside the reference comparison. Descriptor placement differences do not establish missing behavior.',
      ],
    },
  });
  const referenceCatalog =
    catalog ??
    inventoryCatalogSchema.parse({
      schemaVersion: 1,
      targets: targets.map(({ target, members }) => ({
        target,
        keys: members.map(({ key }) => key),
      })),
    });
  return { catalog: referenceCatalog, collection };
};
