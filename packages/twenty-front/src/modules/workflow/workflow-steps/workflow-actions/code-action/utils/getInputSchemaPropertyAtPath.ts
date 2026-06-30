import {
  type InputSchema,
  type InputSchemaProperty,
} from 'twenty-shared/workflow';
import { isDefined } from 'twenty-shared/utils';

export const getInputSchemaPropertyAtPath = (
  inputSchema: InputSchema | undefined,
  path: string[],
): InputSchemaProperty | undefined => {
  if (!isDefined(inputSchema) || inputSchema.length === 0) {
    return undefined;
  }

  let current: InputSchemaProperty | undefined = inputSchema[0];

  for (const segment of path) {
    if (!isDefined(current)) {
      return undefined;
    }

    if (current.type === 'object' && isDefined(current.properties?.[segment])) {
      current = current.properties[segment];
    } else {
      return undefined;
    }
  }

  return current;
};
