import { isNull, isUndefined } from '@sniptt/guards';

export const readInventoryDataProperty = ({
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
    if (isUndefined(descriptor)) {
      current = Object.getPrototypeOf(current);
      continue;
    }
    if (!('value' in descriptor)) {
      throw new Error(`Accessor not invoked while resolving ${name}`);
    }
    return descriptor.value;
  }
  return undefined;
};
