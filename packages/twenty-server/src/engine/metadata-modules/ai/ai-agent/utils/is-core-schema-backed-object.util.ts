const CORE_SCHEMA_BACKED_STANDARD_OBJECT_NAMES = [
  'connectedAccount',
  'messageChannel',
  'calendarChannel',
  'messageFolder',
] as const;

// Leftover workspace object metadata still names these after the v1.21
// core-schema migration; DATABASE_CRUD would query empty workspace tables.
export const isCoreSchemaBackedObject = (objectMetadata: {
  nameSingular: string;
}): boolean => {
  return CORE_SCHEMA_BACKED_STANDARD_OBJECT_NAMES.includes(
    objectMetadata.nameSingular as (typeof CORE_SCHEMA_BACKED_STANDARD_OBJECT_NAMES)[number],
  );
};
