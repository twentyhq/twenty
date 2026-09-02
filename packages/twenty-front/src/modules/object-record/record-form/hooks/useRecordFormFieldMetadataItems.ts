import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { computeRecordFormFieldMetadataItems } from '@/object-record/record-form/utils/computeRecordFormFieldMetadataItems';
import { recordFormPageLayoutByObjectMetadataIdFamilySelector } from '@/page-layout/states/selectors/recordFormPageLayoutByObjectMetadataIdFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { isDefined } from 'twenty-shared/utils';

export const useRecordFormFieldMetadataItems = ({
  objectMetadataItem,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
}): { recordFormFieldMetadataItems: FieldMetadataItem[] } => {
  const recordFormPageLayout = useAtomFamilySelectorValue(
    recordFormPageLayoutByObjectMetadataIdFamilySelector,
    { objectMetadataId: objectMetadataItem.id },
  );

  if (!isDefined(recordFormPageLayout)) {
    return { recordFormFieldMetadataItems: [] };
  }

  return {
    recordFormFieldMetadataItems: computeRecordFormFieldMetadataItems({
      recordFormPageLayout,
      fieldMetadataItems: objectMetadataItem.fields,
    }),
  };
};
