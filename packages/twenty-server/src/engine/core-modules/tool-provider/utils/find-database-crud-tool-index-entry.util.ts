import { isDefined } from 'twenty-shared/utils';

import { type DatabaseCrudOperation } from 'src/engine/core-modules/tool-provider/constants/database-crud-operation.const';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { findSimilarToolNames } from 'src/engine/core-modules/tool-provider/utils/find-similar-tool-names.util';

export type DatabaseCrudToolIndexEntryLookup =
  | { status: 'found'; entry: ToolIndexEntry }
  | { status: 'operationNotAvailable'; objectNameSingular: string }
  | { status: 'objectNotFound'; similarObjectNames: string[] };

const normalizeObjectName = (objectName: string): string =>
  objectName.replace(/[\s_-]/g, '').toLowerCase();

// Accepts the singular or plural name in camelCase or snake_case, since tool names carry either form
export const findDatabaseCrudToolIndexEntry = ({
  toolIndex,
  objectName,
  operation,
}: {
  toolIndex: ToolIndexEntry[];
  objectName: string;
  operation: DatabaseCrudOperation;
}): DatabaseCrudToolIndexEntryLookup => {
  const normalizedObjectName = normalizeObjectName(objectName);
  const objectNameSingularByAlias = new Map<string, string>();
  let matchedObjectNameSingular: string | undefined;

  for (const entry of toolIndex) {
    if (entry.executionRef.kind !== 'database_crud') {
      continue;
    }

    const { objectNameSingular } = entry.executionRef;
    const nameInToolName = entry.name.slice(
      entry.executionRef.operation.length + 1,
    );

    objectNameSingularByAlias.set(nameInToolName, objectNameSingular);

    if (
      normalizeObjectName(objectNameSingular) === normalizedObjectName ||
      normalizeObjectName(nameInToolName) === normalizedObjectName
    ) {
      matchedObjectNameSingular = objectNameSingular;
    }
  }

  if (!isDefined(matchedObjectNameSingular)) {
    return {
      status: 'objectNotFound',
      similarObjectNames: findSimilarToolNames(objectName, [
        ...objectNameSingularByAlias.keys(),
      ]),
    };
  }

  const entry = toolIndex.find(
    (candidate) =>
      candidate.executionRef.kind === 'database_crud' &&
      candidate.executionRef.objectNameSingular === matchedObjectNameSingular &&
      candidate.executionRef.operation === operation,
  );

  return isDefined(entry)
    ? { status: 'found', entry }
    : {
        status: 'operationNotAvailable',
        objectNameSingular: matchedObjectNameSingular,
      };
};
