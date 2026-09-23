import { isDefined } from 'twenty-shared/utils';

import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';

export const DATABASE_CRUD_NAME_GRAMMAR =
  'Tool name = operation + object name. *_many_* operations use the plural form, *_one_* use the singular form.';

export type DatabaseCrudObjectNames = {
  plural?: string;
  singular?: string;
};

export type DatabaseCrudObjectGroup = {
  operations: string[];
  objects: DatabaseCrudObjectNames[];
};

export type CollapsedDatabaseCrudTools = {
  // One group per distinct operation set. Permissions are resolved per object,
  // so a single flat operation list would advertise names that do not exist.
  objectGroups: DatabaseCrudObjectGroup[];
  standaloneTools: ToolIndexEntry[];
  exampleToolNames: string[];
  toolCount: number;
};

const getObjectNames = (entries: ToolIndexEntry[]): DatabaseCrudObjectNames => {
  const names: DatabaseCrudObjectNames = {};

  // Object metadata carries camelCase singular names while tool names are
  // snake_case, so the only reliable source for both forms is the tool name.
  for (const entry of entries) {
    const nameSegment = entry.name.slice(`${entry.operation}_`.length);

    if (entry.operation?.endsWith('_one')) {
      names.singular = names.singular ?? nameSegment;
    } else {
      names.plural = names.plural ?? nameSegment;
    }
  }

  return names;
};

export const collapseDatabaseCrudTools = (
  tools: ToolIndexEntry[],
): CollapsedDatabaseCrudTools => {
  const operationOrder: string[] = [];
  const seenOperations = new Set<string>();

  const entriesByObjectName = new Map<string, ToolIndexEntry[]>();
  const standaloneTools: ToolIndexEntry[] = [];

  for (const tool of tools) {
    if (!isDefined(tool.objectName) || !isDefined(tool.operation)) {
      standaloneTools.push(tool);
      continue;
    }

    const entries = entriesByObjectName.get(tool.objectName) ?? [];

    entries.push(tool);
    entriesByObjectName.set(tool.objectName, entries);

    if (!seenOperations.has(tool.operation)) {
      seenOperations.add(tool.operation);
      operationOrder.push(tool.operation);
    }
  }

  const objectNamesByOperationKey = new Map<
    string,
    DatabaseCrudObjectNames[]
  >();

  for (const objectName of [...entriesByObjectName.keys()].sort()) {
    const entries = entriesByObjectName.get(objectName) ?? [];
    const objectOperations = new Set(
      entries.map((entry) => entry.operation).filter(isDefined),
    );
    const operationKey = operationOrder
      .filter((operation) => objectOperations.has(operation))
      .join(',');

    const objects = objectNamesByOperationKey.get(operationKey) ?? [];

    objects.push(getObjectNames(entries));
    objectNamesByOperationKey.set(operationKey, objects);
  }

  const objectGroups = [...objectNamesByOperationKey.entries()]
    .map(([operationKey, objects]) => ({
      operations: operationKey.split(','),
      objects,
    }))
    .sort((left, right) => right.operations.length - left.operations.length);

  const findManyExample = tools.find((tool) => tool.operation === 'find_many');
  const findOneExample = tools.find(
    (tool) =>
      tool.operation === 'find_one' &&
      tool.objectName === findManyExample?.objectName,
  );
  const exampleToolNames =
    isDefined(findManyExample) && isDefined(findOneExample)
      ? [findManyExample.name, findOneExample.name]
      : [];

  return {
    objectGroups,
    standaloneTools,
    exampleToolNames,
    toolCount: tools.length,
  };
};
