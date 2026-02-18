import { type PropertySchema } from '../schemas';

const SCHEMA_TYPE_TO_CONSTRUCTOR: Record<PropertySchema['type'], string> = {
  boolean: 'Boolean',
  number: 'Number',
  string: 'String',
};

export const schemaTypeToConstructor = (type: PropertySchema['type']): string =>
  SCHEMA_TYPE_TO_CONSTRUCTOR[type];
