// Strips bloat from a Zod-generated JSON Schema to reduce learn_tools token cost.
//  - Removes `$schema` (top-level only)
//  - Removes `additionalProperties: false` at every level

import { isObject, isString } from "@sniptt/guards";
import { isDefined } from "twenty-shared/utils";

//  - Removes `pattern` on UUID strings that already carry `format: "uuid"`
export const leanJsonSchema = (schema: object): object => {
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
    if (isDefined(value) && isObject(value) && !Array.isArray(value)) {
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
