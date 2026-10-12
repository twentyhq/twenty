import { type PropertySchema } from '../schemas';

export const getSpecificProperties = ({
  properties,
  commonPropertyNames,
}: {
  properties: Record<string, PropertySchema>;
  commonPropertyNames: Set<string>;
}): Record<string, PropertySchema> => {
  const specificProperties: Record<string, PropertySchema> = {};

  for (const [propertyName, propertySchema] of Object.entries(properties)) {
    if (!commonPropertyNames.has(propertyName)) {
      specificProperties[propertyName] = propertySchema;
    }
  }

  return specificProperties;
};
