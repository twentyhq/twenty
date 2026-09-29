import { type ComponentSchema, type PropertySchema } from '../schemas';

export const getSpecificProperties = ({
  component,
  commonPropertyNames,
}: {
  component: ComponentSchema;
  commonPropertyNames: Set<string>;
}): Record<string, PropertySchema> => {
  const specific: Record<string, PropertySchema> = {};
  for (const [name, schema] of Object.entries(component.properties)) {
    if (!commonPropertyNames.has(name)) {
      specific[name] = schema;
    }
  }
  return specific;
};
