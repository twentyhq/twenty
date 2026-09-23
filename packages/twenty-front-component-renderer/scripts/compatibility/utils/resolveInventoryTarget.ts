import { isFunction, isObject } from '@sniptt/guards';
import { type z } from 'zod';

import { type inventoryTargetSchema } from '../schemas/inventoryTargetSchema';
import { type InventoryObjects } from '../types/InventoryObjects';
import { readInventoryDataProperty } from './readInventoryDataProperty';

export const resolveInventoryTarget = ({
  target,
  objects,
}: {
  target: z.infer<typeof inventoryTargetSchema>;
  objects: InventoryObjects;
}):
  | { status: 'collected'; value: object }
  | { status: 'missing' | 'uninspectable'; reason: string } => {
  try {
    if (target.kind === 'global') {
      return { status: 'collected', value: objects[target.surface] };
    }
    const value =
      target.kind === 'factory'
        ? objects.factories[target.name]?.()
        : readInventoryDataProperty({
            value: objects[target.surface],
            name: target.name,
          });
    if (!isObject(value) && !isFunction(value)) {
      return {
        status: 'missing',
        reason: 'Target is absent or is not an object',
      };
    }
    if (target.kind !== 'prototype') {
      return { status: 'collected', value };
    }
    const prototype = readInventoryDataProperty({ value, name: 'prototype' });
    if (!isObject(prototype) && !isFunction(prototype)) {
      return {
        status: 'missing',
        reason: 'Prototype is absent or is not an object',
      };
    }
    return { status: 'collected', value: prototype };
  } catch (error) {
    return { status: 'uninspectable', reason: String(error) };
  }
};
