import { type PropertySchema } from '../schemas';
import { schemaTypeToConstructor } from './schema-type-to-constructor';

export const generatePropertiesConfig = (
  properties: Record<string, PropertySchema>,
): string => {
  const entries = Object.entries(properties);
  if (entries.length === 0) {
    return '{}';
  }

  const props = entries
    .map(([name, schema]) => {
      const constructorType = schemaTypeToConstructor(schema.type);
      return `'${name}': { type: ${constructorType} }`;
    })
    .join(', ');

  return `{ ${props} }`;
};
