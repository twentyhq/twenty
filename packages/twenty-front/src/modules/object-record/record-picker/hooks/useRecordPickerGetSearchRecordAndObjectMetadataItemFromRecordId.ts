import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { searchRecordStoreFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { multipleRecordPickerSinglePickableMorphItemComponentFamilySelector } from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerSinglePickableMorphItemComponentFamilySelector';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

type UseRecordPickerGetRecordAndObjectMetadataItemFromRecordIdProps = {
  recordId: string;
};

export const useRecordPickerGetSearchRecordAndObjectMetadataItemFromRecordId =
  ({
    recordId,
  }: UseRecordPickerGetRecordAndObjectMetadataItemFromRecordIdProps) => {
    const { objectMetadataItems } = useObjectMetadataItems();

    const pickableMorphItem = useRecoilComponentFamilyValue(
      multipleRecordPickerSinglePickableMorphItemComponentFamilySelector,
      recordId,
    );

    const searchRecord = useRecoilValue(searchRecordStoreFamilyState(recordId));

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
