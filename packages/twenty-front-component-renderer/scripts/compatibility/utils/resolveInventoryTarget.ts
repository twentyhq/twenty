import { isFunction, isObject, isNull, isUndefined } from '@sniptt/guards';
import { type z } from 'zod';

import { type inventoryTargetSchema } from '../schemas/inventoryTargetSchema';
import { type InventoryObjects } from '../types/InventoryObjects';

const readDataProperty = ({
  value,
  name,
}: {
  value: object;
  name: string;
}): unknown => {
  const visited = new Set<object>();
  let current: object | null = value;
  while (!isNull(current)) {
    if (visited.has(current)) {
      throw new Error(`Prototype cycle resolving ${name}`);
    }
    visited.add(current);
    const descriptor = Object.getOwnPropertyDescriptor(current, name);
    if (!isUndefined(descriptor)) {
      if (!('value' in descriptor)) {
        throw new Error(`Accessor not invoked while resolving ${name}`);
      }
      return descriptor.value;
    }
    current = Object.getPrototypeOf(current);
  }
  return undefined;
};

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
        : readDataProperty({
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
    const prototype = readDataProperty({ value, name: 'prototype' });
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
