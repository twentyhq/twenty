import { isDefined } from 'twenty-shared/utils';

import { isWorkflowRelatedObject } from 'src/engine/metadata-modules/ai/ai-agent/utils/is-workflow-related-object.util';

type FlatObjectWithActivityAndIdentifier = {
  isActive: boolean;
  universalIdentifier: string;
};

export const getDatabaseCrudToolFlatObjects = <
  T extends FlatObjectWithActivityAndIdentifier,
>(
  byUniversalIdentifier: Partial<Record<string, T>>,
): T[] => {
  return Object.values(byUniversalIdentifier)
    .filter(isDefined)
    .filter((obj) => obj.isActive && !isWorkflowRelatedObject(obj));
};
