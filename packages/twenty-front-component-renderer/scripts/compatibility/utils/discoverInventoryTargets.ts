import { isFunction, isObject, isString } from '@sniptt/guards';
import { type z } from 'zod';

import { type inventoryTargetSchema } from '../schemas/inventoryTargetSchema';
import { type InventoryObjects } from '../types/InventoryObjects';
import { inspectInventoryObject } from './inspectInventoryObject';

export const discoverInventoryTargets = (objects: InventoryObjects) => {
  const targets: z.infer<typeof inventoryTargetSchema>[] = [];

  for (const surface of ['globalThis', 'window'] as const) {
    targets.push({ kind: 'global', surface });
    const { descriptors } = inspectInventoryObject({
      value: objects[surface],
      targetId: surface,
    });
    const visitedNamespaces = new Set<object>([
      objects.globalThis,
      objects.window,
    ]);
    for (const [name, descriptor] of descriptors) {
      if (!isString(name) || !('value' in descriptor)) {
        continue;
      }
      const value: unknown = descriptor.value;
      if (isFunction(value)) {
        targets.push({ kind: 'static', surface, name });
        const prototype = Object.getOwnPropertyDescriptor(value, 'prototype');
        if (isObject(prototype?.value) || isFunction(prototype?.value)) {
          targets.push({ kind: 'prototype', surface, name });
        }
        continue;
      }
      if (!isObject(value) || visitedNamespaces.has(value)) {
        continue;
      }
      visitedNamespaces.add(value);
      targets.push({ kind: 'namespace', surface, name });
    }
  }
  for (const name of Object.keys(objects.factories)) {
    targets.push({ kind: 'factory', name });
  }
  return targets;
};
