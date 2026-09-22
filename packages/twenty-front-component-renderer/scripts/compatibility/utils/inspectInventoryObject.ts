import {
  isFunction,
  isString,
  isSymbol,
  isNull,
  isUndefined,
} from '@sniptt/guards';
import { type z } from 'zod';

import { type inventoryMemberSchema } from '../schemas/inventoryMemberSchema';
import { getInventoryMemberId } from './getInventoryMemberId';

export const inspectInventoryObject = ({
  value,
  targetId,
}: {
  value: object;
  targetId: string;
}) => {
  const members: z.infer<typeof inventoryMemberSchema>[] = [];
  const descriptors = new Map<PropertyKey, PropertyDescriptor>();
  const skipped: { id: string; reason: string }[] = [];
  const visited = new Set<object>();
  const seenKeys = new Set<PropertyKey>();
  const wellKnownSymbols = new Map<symbol, string>();

  for (const [name, descriptor] of Object.entries(
    Object.getOwnPropertyDescriptors(Symbol),
  )) {
    if (isSymbol(descriptor.value)) {
      wellKnownSymbols.set(descriptor.value, name);
    }
  }

  let current: object | null = value;
  let depth = 0;

  while (!isNull(current)) {
    if (visited.has(current)) {
      throw new Error(`Prototype cycle while collecting ${targetId}`);
    }
    visited.add(current);

    for (const propertyKey of Reflect.ownKeys(current)) {
      if (seenKeys.has(propertyKey)) {
        continue;
      }
      seenKeys.add(propertyKey);
      const symbolName = isString(propertyKey)
        ? undefined
        : wellKnownSymbols.get(propertyKey);
      const registeredName = isString(propertyKey)
        ? undefined
        : Symbol.keyFor(propertyKey);
      const key = isString(propertyKey)
        ? { kind: 'string' as const, name: propertyKey }
        : !isUndefined(symbolName)
          ? { kind: 'well-known-symbol' as const, name: symbolName }
          : { kind: 'registered-symbol' as const, name: registeredName ?? '' };

      if (
        !isString(propertyKey) &&
        isUndefined(symbolName) &&
        isUndefined(registeredName)
      ) {
        skipped.push({
          id: targetId,
          reason: `Unstable local symbol: ${String(propertyKey)}`,
        });
        continue;
      }

      const id = getInventoryMemberId({ targetId, key });
      try {
        const descriptor = Object.getOwnPropertyDescriptor(
          current,
          propertyKey,
        );
        if (isUndefined(descriptor)) {
          throw new Error('Enumerated property has no inspectable descriptor');
        }
        descriptors.set(propertyKey, descriptor);
        const placement = {
          depth,
          enumerable: descriptor.enumerable === true,
          configurable: descriptor.configurable === true,
        };
        const observation: z.infer<
          typeof inventoryMemberSchema
        >['observation'] =
          'value' in descriptor
            ? {
                shape: isFunction(descriptor.value) ? 'callable' : 'value',
                valueType: typeof descriptor.value,
                writable: descriptor.writable === true,
                ...placement,
              }
            : {
                shape: 'accessor',
                getter: isFunction(descriptor.get),
                setter: isFunction(descriptor.set),
                ...placement,
              };
        members.push({ id, key, observation });
      } catch (error) {
        members.push({
          id,
          key,
          observation: { shape: 'uninspectable', reason: String(error) },
        });
      }
    }
    current = Object.getPrototypeOf(current);
    depth += 1;
  }

  return { members, descriptors, skipped };
};
