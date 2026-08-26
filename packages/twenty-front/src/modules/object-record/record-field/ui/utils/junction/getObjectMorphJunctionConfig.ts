import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import {
  getJunctionConfig,
  type JunctionConfig,
} from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { getSourceJoinColumnName } from '@/object-record/record-field/ui/utils/junction/getSourceJoinColumnName';
import { isJunctionRelationField } from '@/object-record/record-field/ui/utils/junction/isJunctionRelationField';
import { isDefined } from 'twenty-shared/utils';

type ObjectMorphJunctionConfig = JunctionConfig & {
  // Field on the object holding the junction records, e.g. `note.noteTargets`
  junctionField: FieldMetadataItem;
  // Field on the junction pointing back at the object, e.g. `noteTarget.note`
  sourceField: FieldMetadataItem;
  // Join column of the object on the junction, e.g. `noteTarget.noteId`
  sourceJoinColumnName: string;
  junctionObjectMetadata: EnrichedObjectMetadataItem;
};

// A morph junction is the one an object uses to reach records of any type, so an object has
// at most one: unlike a junction to a single object, it needs no other to reach the rest.
export const getObjectMorphJunctionConfig = ({
  objectMetadata,
  objectMetadataItems,
}: {
  objectMetadata: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): ObjectMorphJunctionConfig | null => {
  for (const junctionField of objectMetadata.fields) {
    if (!isJunctionRelationField(junctionField)) {
      continue;
    }

    const junctionConfig = getJunctionConfig({
      settings: junctionField.settings,
      relationObjectMetadataId:
        junctionField.relation?.targetObjectMetadata.id ?? '',
      sourceObjectMetadataId: objectMetadata.id,
      objectMetadataItems,
    });

    if (
      !junctionConfig?.isMorphRelation ||
      !isDefined(junctionConfig.sourceField)
    ) {
      continue;
    }

    const junctionObjectMetadata = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id === junctionConfig.junctionObjectMetadata.id,
    );

    const sourceJoinColumnName = getSourceJoinColumnName({
      sourceField: junctionConfig.sourceField,
      sourceObjectMetadata: objectMetadata,
    });

    if (
      !isDefined(junctionObjectMetadata) ||
      !isDefined(sourceJoinColumnName)
    ) {
      continue;
    }

    return {
      ...junctionConfig,
      junctionObjectMetadata,
      junctionField,
      sourceField: junctionConfig.sourceField,
      sourceJoinColumnName,
    };
  }

  return null;
};
