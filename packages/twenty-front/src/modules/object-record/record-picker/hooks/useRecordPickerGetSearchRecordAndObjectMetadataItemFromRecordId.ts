import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { searchRecordStoreFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { multipleRecordPickerSinglePickableMorphItemComponentFamilySelector } from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerSinglePickableMorphItemComponentFamilySelector';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';
import { useRecoilComponentFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilySelectorValueV2';
import { isDefined } from 'twenty-shared/utils';

type UseRecordPickerGetRecordAndObjectMetadataItemFromRecordIdProps = {
  recordId: string;
};

export const useRecordPickerGetSearchRecordAndObjectMetadataItemFromRecordId =
  ({
    recordId,
  }: UseRecordPickerGetRecordAndObjectMetadataItemFromRecordIdProps) => {
    const { objectMetadataItems } = useObjectMetadataItems();

    const pickableMorphItem = useRecoilComponentFamilySelectorValueV2(
      multipleRecordPickerSinglePickableMorphItemComponentFamilySelector,
      recordId,
    );

    const searchRecord = useFamilyRecoilValueV2(
      searchRecordStoreFamilyState,
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
