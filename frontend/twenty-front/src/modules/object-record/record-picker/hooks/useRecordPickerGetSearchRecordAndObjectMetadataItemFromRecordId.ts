import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { searchRecordStoreFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { multipleRecordPickerSinglePickableMorphItemComponentFamilySelector } from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerSinglePickableMorphItemComponentFamilySelector';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
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

    const searchRecordStore = useAtomFamilyStateValue(
      searchRecordStoreFamilyState,
      recordId,
    );

    if (!isDefined(pickableMorphItem) || !isDefined(searchRecordStore)) {
      return { searchRecord: null, objectMetadataItem: null };
    }

    const objectMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id === pickableMorphItem.objectMetadataId,
    );

    if (!isDefined(objectMetadataItem)) {
      return { searchRecord: null, objectMetadataItem: null };
    }

    return { searchRecord: searchRecordStore, objectMetadataItem };
  };
