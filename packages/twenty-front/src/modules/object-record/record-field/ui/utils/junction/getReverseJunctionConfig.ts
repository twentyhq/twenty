import {
  getJunctionConfig,
  type JunctionObjectMetadataItem,
} from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { getTargetObjectMetadataIdsFromField } from '@/object-record/record-field/ui/utils/junction/getTargetObjectMetadataIdsFromField';
import { isDefined } from 'twenty-shared/utils';

type ReverseJunctionConfig = {
  junctionObjectMetadata: JunctionObjectMetadataItem;
  relatedObjectMetadata: JunctionObjectMetadataItem;
  relationFieldName: string;
};

type GetReverseJunctionConfigArgs = {
  junctionObjectMetadataId?: string;
  sourceObjectMetadataId?: string;
  objectMetadataItems: JunctionObjectMetadataItem[];
};

// Only the owning side of a junction carries the junction settings, so reaching the owner
// from one of its targets means looking for the object whose junction field points here.
export const getReverseJunctionConfig = ({
  junctionObjectMetadataId,
  sourceObjectMetadataId,
  objectMetadataItems,
}: GetReverseJunctionConfigArgs): ReverseJunctionConfig | null => {
  if (
    !isDefined(junctionObjectMetadataId) ||
    !isDefined(sourceObjectMetadataId)
  ) {
    return null;
  }

  for (const relatedObjectMetadata of objectMetadataItems) {
    for (const forwardJunctionField of relatedObjectMetadata.fields) {
      if (
        forwardJunctionField.relation?.targetObjectMetadata.id !==
        junctionObjectMetadataId
      ) {
        continue;
      }

      const junctionConfig = getJunctionConfig({
        settings: forwardJunctionField.settings,
        relationObjectMetadataId: junctionObjectMetadataId,
        relationTargetFieldMetadataId:
          forwardJunctionField.relation?.targetFieldMetadata.id,
        sourceObjectMetadataId: relatedObjectMetadata.id,
        objectMetadataItems,
      });

      if (!isDefined(junctionConfig?.sourceField)) {
        continue;
      }

      const targetsSourceObject = junctionConfig.targetFields.some(
        (targetField) =>
          getTargetObjectMetadataIdsFromField(targetField).includes(
            sourceObjectMetadataId,
          ),
      );

      if (targetsSourceObject) {
        return {
          junctionObjectMetadata: junctionConfig.junctionObjectMetadata,
          relatedObjectMetadata,
          relationFieldName: junctionConfig.sourceField.name,
        };
      }
    }
  }

  return null;
};
