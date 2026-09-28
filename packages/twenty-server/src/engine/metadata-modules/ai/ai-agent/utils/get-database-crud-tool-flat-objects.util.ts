import { MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isWorkflowRelatedObject } from 'src/engine/metadata-modules/ai/ai-agent/utils/is-workflow-related-object.util';
import {
  type OverridableFlatEntity,
  resolveEffectiveFlatEntityProperty,
} from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';

type FlatObjectWithActivityAndIdentifier = OverridableFlatEntity & {
  isActive: boolean;
  readability: MetadataReadability;
  universalIdentifier: string;
};

export const getDatabaseCrudToolFlatObjects = <
  TFlatObject extends FlatObjectWithActivityAndIdentifier,
>(
  byUniversalIdentifier: Partial<Record<string, TFlatObject>>,
): TFlatObject[] => {
  return Object.values(byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (objectMetadata) =>
        objectMetadata.readability !== MetadataReadability.SYSTEM &&
        resolveEffectiveFlatEntityProperty({
          metadataName: 'objectMetadata',
          flatEntity: objectMetadata,
          property: 'isActive',
        }) &&
        !isWorkflowRelatedObject(objectMetadata),
    );
};
