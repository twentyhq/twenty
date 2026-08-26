import { type JunctionObjectMetadataItem } from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { isJunctionRelationField } from '@/object-record/record-field/ui/utils/junction/isJunctionRelationField';
import { isDefined } from 'twenty-shared/utils';

// A junction object carries no marker of its own: it is only known as a junction through
// the field configured to reach its targets, so the whole graph is walked to collect them.
export const getJunctionObjectMetadataIds = (
  objectMetadataItems: JunctionObjectMetadataItem[],
): Set<string> =>
  new Set(
    objectMetadataItems.flatMap((objectMetadataItem) =>
      objectMetadataItem.fields
        .filter(isJunctionRelationField)
        .map((junctionField) => junctionField.relation?.targetObjectMetadata.id)
        .filter(isDefined),
    ),
  );
