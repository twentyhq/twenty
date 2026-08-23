import { ObjectType } from "src/logic-functions/types/find-objects-fields.type";
import { objectsToOmitFromRecordMigration } from "src/constants/to-omit";
import { sortObjectsByDependency } from "src/logic-functions/utils/sort-objects-by-dependency.util";

// The order is derived rather than persisted: stage3 tracks progress through it with an index,
// so it has to be reproducible across invocations from the persisted source objects alone.
export const buildRecordMigrationOrder = (sourceWorkspaceObjects: ObjectType[]): ObjectType[] =>
  sortObjectsByDependency(
    sourceWorkspaceObjects.filter(
      (object) => objectsToOmitFromRecordMigration.includes(object.nameSingular) === false,
    ),
  );
