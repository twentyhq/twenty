import { ObjectType } from "src/logic-functions/types/find-objects-fields.type";
import { objectsToOmitFromRecordMigration } from "src/constants/to-omit";
import { sortObjectsByDependency } from "src/logic-functions/utils/sort-objects-by-dependency.util";

// stage3 consumes migrationState.recordMigrationOrder destructively (it slices off each object
// as it finishes so a resumed run picks up where it left off), so the relation reconciliation
// that runs afterwards has to rebuild the same order from the persisted source objects rather
// than read it back. Both callers go through here to keep the two orders identical.
export const buildRecordMigrationOrder = (sourceWorkspaceObjects: ObjectType[]): ObjectType[] =>
  sortObjectsByDependency(
    sourceWorkspaceObjects.filter(
      (object) => objectsToOmitFromRecordMigration.includes(object.nameSingular) === false,
    ),
  );
