import { isDefined } from 'twenty-shared/utils';

import { isWorkflowRelatedObject } from 'src/engine/metadata-modules/ai/ai-agent/utils/is-workflow-related-object.util';
import {
  type OverridableFlatEntity,
  resolveEffectiveFlatEntityProperty,
} from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';

type FlatObjectWithActivityAndIdentifier = OverridableFlatEntity & {
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
    .filter(
      (obj) =>
        resolveEffectiveFlatEntityProperty(obj, 'isActive') &&
        !isWorkflowRelatedObject(obj),
    );
};
