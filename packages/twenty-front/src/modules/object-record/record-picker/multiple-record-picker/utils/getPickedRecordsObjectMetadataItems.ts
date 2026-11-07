import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { isDefined } from 'twenty-shared/utils';

export const getPickedRecordsObjectMetadataItems = ({
  searchableObjectMetadataItems,
  pickedMorphItems,
  objectMetadataItems,
}: {
  searchableObjectMetadataItems: EnrichedObjectMetadataItem[];
  pickedMorphItems: Pick<RecordPickerPickableMorphItem, 'objectMetadataId'>[];
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): EnrichedObjectMetadataItem[] => {
  const pickedObjectMetadataItems = [
    ...new Set(
      pickedMorphItems.map(({ objectMetadataId }) => objectMetadataId),
    ),
  ]
    .filter(
      (objectMetadataId) =>
        !searchableObjectMetadataItems.some(
          ({ id }) => id === objectMetadataId,
        ),
    )
    .map((objectMetadataId) =>
      objectMetadataItems.find(({ id }) => id === objectMetadataId),
    )
    .filter(isDefined);

  return [...searchableObjectMetadataItems, ...pickedObjectMetadataItems];
};
