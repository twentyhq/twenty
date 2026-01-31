import { type PropertySchema } from '../schemas';
import { schemaTypeToTs } from './schema-type-to-ts';

export const generatePropertiesType = (
  properties: Record<string, PropertySchema>,
): string => {
  const entries = Object.entries(properties);
  if (entries.length === 0) {
    return 'Record<string, never>';
  }

  const props = entries
    .map(([name, schema]) => {
      const tsType = schemaTypeToTs(schema.type);
      const optional = schema.optional ? '?' : '';
      return `'${name}'${optional}: ${tsType}`;
    })
    .join('; ');

  return `{ ${props} }`;
};
