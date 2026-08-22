import { migrationState, setStateRef } from "src/logic-functions/utils/migration-state.util";

export const setObjectCursor = (namePlural: string, after: string | null): void => {
  const objectRecordsToMigrate = new Map(migrationState.objectRecordsToMigrate);
  if (after === null) {
    objectRecordsToMigrate.delete(namePlural);
  } else {
    objectRecordsToMigrate.set(namePlural, after);
  }
  setStateRef('objectRecordsToMigrate', objectRecordsToMigrate);
};