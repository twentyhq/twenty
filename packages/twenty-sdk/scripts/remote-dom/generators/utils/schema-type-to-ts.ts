import { type PropertySchema } from '../schemas';

const SCHEMA_TYPE_TO_TS: Record<PropertySchema['type'], string> = {
  boolean: 'boolean',
  number: 'number',
  string: 'string',
  array: 'unknown[]',
  object: 'Record<string, unknown>',
  function: '(...args: unknown[]) => unknown',
};

export const schemaTypeToTs = (type: PropertySchema['type']): string =>
  SCHEMA_TYPE_TO_TS[type];
