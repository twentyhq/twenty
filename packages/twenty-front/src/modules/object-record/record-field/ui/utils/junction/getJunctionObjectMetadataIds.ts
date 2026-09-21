import { getJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { getFieldRelations } from '@/object-record/record-field/ui/utils/junction/getFieldRelations';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import { type JunctionObjectMetadataItem } from '@/object-record/record-field/ui/utils/junction/types/JunctionObjectMetadataItem';

// A junction object carries no marker of its own, so the relation graph is walked to
// collect every object resolved as a junction.
export const getJunctionObjectMetadataIds = (
  objectMetadataItems: JunctionObjectMetadataItem[],
): Set<string> =>
  new Set(
    objectMetadataItems.flatMap((objectMetadataItem) =>
      objectMetadataItem.fields.flatMap((field) =>
        getFieldRelations(field)
          .filter((relation) =>
            isUsableJunctionConfig(
              getJunctionConfig({
                settings: field.settings,
                relationObjectMetadataId: relation.targetObjectMetadata.id,
                relationTargetFieldMetadataId: relation.targetFieldMetadata.id,
                sourceObjectMetadataId: objectMetadataItem.id,
                objectMetadataItems,
              }),
            ),
          )
          .map((relation) => relation.targetObjectMetadata.id),
      ),
    ),
  );
