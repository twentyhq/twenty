import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { searchRecordStoreFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { multipleRecordPickerSinglePickableMorphItemComponentFamilySelector } from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerSinglePickableMorphItemComponentFamilySelector';
import { useFamilyAtomValue } from '@/ui/utilities/state/jotai/hooks/useFamilyAtomValue';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { isDefined } from 'twenty-shared/utils';

type UseRecordPickerGetRecordAndObjectMetadataItemFromRecordIdProps = {
  recordId: string;
};

export const useRecordPickerGetSearchRecordAndObjectMetadataItemFromRecordId =
  ({
    recordId,
  }: UseRecordPickerGetRecordAndObjectMetadataItemFromRecordIdProps) => {
    const { objectMetadataItems } = useObjectMetadataItems();

    const pickableMorphItem = useAtomComponentFamilySelectorValue(
      multipleRecordPickerSinglePickableMorphItemComponentFamilySelector,
      recordId,
    );

    const searchRecord = useFamilyAtomValue(
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
