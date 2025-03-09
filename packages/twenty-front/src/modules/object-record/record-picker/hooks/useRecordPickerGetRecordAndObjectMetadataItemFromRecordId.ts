import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { multipleRecordPickerSinglePickableMorphItemComponentFamilySelector } from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerSinglePickableMorphItemComponentFamilySelector';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

type UseRecordPickerGetRecordAndObjectMetadataItemFromRecordIdProps = {
  recordId: string;
};

export const useRecordPickerGetRecordAndObjectMetadataItemFromRecordId = ({
  recordId,
}: UseRecordPickerGetRecordAndObjectMetadataItemFromRecordIdProps) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const pickableMorphItem = useRecoilComponentFamilyValueV2(
    multipleRecordPickerSinglePickableMorphItemComponentFamilySelector,
    recordId,
  );

  const record = useRecoilValue(recordStoreFamilyState(recordId));

  if (!isDefined(pickableMorphItem)) {
    return { record: null, objectMetadataItem: null };
  }

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.id === pickableMorphItem.objectMetadataId,
  );

  if (!isDefined(objectMetadataItem)) {
    return { record: null, objectMetadataItem: null };
  }

  return { record, objectMetadataItem };
};
