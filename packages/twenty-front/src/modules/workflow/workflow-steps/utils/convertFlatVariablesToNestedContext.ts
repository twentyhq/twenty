import { isPlainObject } from 'twenty-shared/utils';

export const convertFlatVariablesToNestedContext = (flatVariables: {
  [variablePath: string]: unknown;
}): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(flatVariables)) {
    const parts = key.split('.');
    let current = result;

    for (const part of parts.slice(0, -1)) {
      const existingNode = current[part];

      if (isPlainObject(existingNode)) {
        current = existingNode;
      } else {
        const node: Record<string, unknown> = {};

        current[part] = node;
        current = node;
      }
    }

    current[parts[parts.length - 1]] = value;
  }

  return result;
};
