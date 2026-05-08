import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

// Standard objects whose data lives in the core PostgreSQL schema (not the
// per-workspace schema) after the v1.21 messaging-infrastructure migration.
// Workspace-scoped queries against these objects return 0 rows, so they must
// be excluded from workspace-scoped read tool generation.
const CORE_SCHEMA_BACKED_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.connectedAccount.universalIdentifier,
  STANDARD_OBJECTS.messageChannel.universalIdentifier,
  STANDARD_OBJECTS.calendarChannel.universalIdentifier,
  STANDARD_OBJECTS.messageFolder.universalIdentifier,
] as const;

export const isCoreSchemaBackedObject = (objectMetadata: {
  universalIdentifier: string;
}): boolean => {
  return CORE_SCHEMA_BACKED_OBJECT_UNIVERSAL_IDENTIFIERS.includes(
    objectMetadata.universalIdentifier as (typeof CORE_SCHEMA_BACKED_OBJECT_UNIVERSAL_IDENTIFIERS)[number],
  );
};
