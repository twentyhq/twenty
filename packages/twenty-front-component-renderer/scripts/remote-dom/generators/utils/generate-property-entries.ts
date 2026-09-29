import { type PropertySchema } from '../schemas';

export const generatePropertyEntries = (
  properties: Record<string, PropertySchema>,
): string[] =>
  Object.entries(properties).map(([name, schema]) => {
    const optional = schema.optional ? '?' : '';
    return `'${name}'${optional}: ${schema.type}`;
  });
