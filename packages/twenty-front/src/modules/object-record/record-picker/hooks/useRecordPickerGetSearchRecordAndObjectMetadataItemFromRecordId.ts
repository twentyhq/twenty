import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { searchRecordStoreComponentFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { multipleRecordPickerSinglePickableMorphItemComponentFamilySelector } from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerSinglePickableMorphItemComponentFamilySelector';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { isDefined } from 'twenty-shared/utils';

type UseRecordPickerGetRecordAndObjectMetadataItemFromRecordIdProps = {
  recordId: string;
};

export const useRecordPickerGetSearchRecordAndObjectMetadataItemFromRecordId =
  ({
    recordId,
  }: UseRecordPickerGetRecordAndObjectMetadataItemFromRecordIdProps) => {
    const { objectMetadataItems } = useObjectMetadataItems();

    const pickableMorphItem = useRecoilComponentFamilyValueV2(
      multipleRecordPickerSinglePickableMorphItemComponentFamilySelector,
      recordId,
    );

    const searchRecord = useRecoilComponentFamilyValueV2(
      searchRecordStoreComponentFamilyState,
      recordId,
    );

    if (!isDefined(pickableMorphItem) || !isDefined(searchRecord)) {
      return { searchRecord: null, objectMetadataItem: null };
    }

    const objectMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id === pickableMorphItem.objectMetadataId,
    );

    if (!isDefined(objectMetadataItem)) {
      return { searchRecord: null, objectMetadataItem: null };
    }

    return { searchRecord, objectMetadataItem };
  };
