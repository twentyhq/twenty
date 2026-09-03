import { isDefined } from 'twenty-shared/utils';

import { isCoreSchemaBackedObject } from 'src/engine/metadata-modules/ai/ai-agent/utils/is-core-schema-backed-object.util';
import { isWorkflowRelatedObject } from 'src/engine/metadata-modules/ai/ai-agent/utils/is-workflow-related-object.util';

type FlatObjectForDatabaseCrudTools = {
  isActive: boolean;
  universalIdentifier: string;
  nameSingular: string;
};

export const getDatabaseCrudToolFlatObjects = <
  T extends FlatObjectForDatabaseCrudTools,
>(
  byUniversalIdentifier: Partial<Record<string, T>>,
): T[] => {
  return Object.values(byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (obj) =>
        obj.isActive &&
        !isWorkflowRelatedObject(obj) &&
        !isCoreSchemaBackedObject(obj),
    );
};
