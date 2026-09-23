import { isFunction, isObject, isUndefined } from '@sniptt/guards';
import { type z } from 'zod';

import { type inventoryCollectionSchema } from '../schemas/inventoryCollectionSchema';
import { type InventoryObjects } from '../types/InventoryObjects';
import { readInventoryDataProperty } from './readInventoryDataProperty';

type InventoryCollection = z.infer<typeof inventoryCollectionSchema>;

const readExpandableValue = ({
  value,
  name,
}: {
  value: object;
  name: string;
}): unknown => {
  try {
    const propertyValue = readInventoryDataProperty({ value, name });
    return isObject(propertyValue) || isFunction(propertyValue)
      ? propertyValue
      : undefined;
  } catch {
    return undefined;
  }
};

export const getDistinctWindowValueDisclosures = ({
  objects,
  targets,
}: {
  objects: InventoryObjects;
  targets: InventoryCollection['targets'];
}): InventoryCollection['coverage']['skipped'] => {
  if (objects.window === objects.globalThis) {
    return [];
  }
  const windowTarget = targets.find(
    ({ target }) => target.kind === 'global' && target.surface === 'window',
  );
  return (windowTarget?.members ?? []).flatMap(({ id, key }) => {
    if (key.kind !== 'string') {
      return [];
    }
    const windowValue = readExpandableValue({
      value: objects.window,
      name: key.name,
    });
    const isDistinctWindowValue =
      !isUndefined(windowValue) &&
      windowValue !==
        readExpandableValue({ value: objects.globalThis, name: key.name });
    return isDistinctWindowValue
      ? [
          {
            id,
            reason:
              'Window value differs from globalThis; its members are not expanded separately',
          },
        ]
      : [];
  });
};
