import { isObject, isString } from '@sniptt/guards';

export const leanJsonSchema = (
  schema: Record<string, unknown>,
): Record<string, unknown> => {
  return stripRecursive(structuredClone(schema), true);
};

const stripRecursive = (
  node: Record<string, unknown>,
  isRoot: boolean,
): Record<string, unknown> => {
  if (isRoot) {
    delete node['$schema'];
  }

  if (node['additionalProperties'] === false) {
    delete node['additionalProperties'];
  }

  if (
    node['type'] === 'string' &&
    node['format'] === 'uuid' &&
    isString(node['pattern'])
  ) {
    delete node['pattern'];
  }

  for (const value of Object.values(node)) {
    if (isObject(value) && !Array.isArray(value)) {
      stripRecursive(value as Record<string, unknown>, false);
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== null && typeof item === 'object') {
          stripRecursive(item as Record<string, unknown>, false);
        }
      }
    }
  }

  return node;
};
