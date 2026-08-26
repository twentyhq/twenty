import {
  getJunctionConfig,
  type JunctionObjectMetadataItem,
} from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { isDefined } from 'twenty-shared/utils';

// A junction object carries no marker of its own, so the relation graph is walked to
// collect every object resolved as a junction.
export const getJunctionObjectMetadataIds = (
  objectMetadataItems: JunctionObjectMetadataItem[],
): Set<string> =>
  new Set(
    objectMetadataItems.flatMap((objectMetadataItem) =>
      objectMetadataItem.fields
        .filter((field) =>
          isDefined(
            getJunctionConfig({
              settings: field.settings,
              relationObjectMetadataId:
                field.relation?.targetObjectMetadata.id ?? '',
              relationTargetFieldMetadataId:
                field.relation?.targetFieldMetadata.id,
              sourceObjectMetadataId: objectMetadataItem.id,
              objectMetadataItems,
            }),
          ),
        )
        .map((junctionField) => junctionField.relation?.targetObjectMetadata.id)
        .filter(isDefined),
    ),
  );
