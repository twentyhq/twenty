import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { type RecordFormField } from '@/object-record/record-form/types/RecordFormField';
import { computeRecordFormFields } from '@/object-record/record-form/utils/computeRecordFormFields';
import { recordFormPageLayoutByObjectMetadataIdFamilySelector } from '@/page-layout/states/selectors/recordFormPageLayoutByObjectMetadataIdFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { isDefined } from 'twenty-shared/utils';

export const useRecordFormFields = ({
  objectMetadataItem,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
}): { recordFormFields: RecordFormField<FieldMetadataItem>[] } => {
  const recordFormPageLayout = useAtomFamilySelectorValue(
    recordFormPageLayoutByObjectMetadataIdFamilySelector,
    { objectMetadataId: objectMetadataItem.id },
  );

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  if (!isDefined(recordFormPageLayout)) {
    return { recordFormFields: [] };
  }

  return {
    recordFormFields: computeRecordFormFields({
      recordFormPageLayout,
      fieldMetadataItems: objectMetadataItem.fields,
      restrictedFields: objectPermissions.restrictedFields,
    }),
  };
};
