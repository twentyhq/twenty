import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
import { useUpsertRecordField } from '@/object-record/record-field/hooks/useUpsertRecordField';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { buildAddedRecordField } from '@/object-record/record-field/utils/buildAddedRecordField';
import { findCanonicalRecordField } from '@/object-record/record-field/utils/findCanonicalRecordField';
import { mapRecordFieldToViewField } from '@/views/utils/mapRecordFieldToViewField';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { sortByProperty } from '~/utils/array/sortByProperty';

export const useChangeRecordFieldVisibility = (
  recordFieldComponentInstanceId?: string,
) => {
  const currentRecordFields = useAtomComponentStateValue(
    currentRecordFieldsComponentState,
    recordFieldComponentInstanceId,
  );

  const { updateRecordField } = useUpdateRecordField(
    recordFieldComponentInstanceId,
  );
  const { upsertRecordField } = useUpsertRecordField(
    recordFieldComponentInstanceId,
  );

  const { saveViewFields } = useSaveCurrentViewFields();

  const getLastPosition = () =>
    currentRecordFields.toSorted(sortByProperty('position', 'desc'))?.[0]
      ?.position ?? 0;

  const changeRecordFieldVisibility = async ({
    fieldMetadataId,
    recordFieldId,
    isVisible,
  }: {
    fieldMetadataId: string;
    recordFieldId?: string;
    isVisible: boolean;
  }) => {
    const lastPosition = getLastPosition();

    const shouldShowFieldMetadataItem = isVisible === true;
    const correspondingRecordField = isDefined(recordFieldId)
      ? currentRecordFields.find(
          (recordFieldToFind) => recordFieldToFind.id === recordFieldId,
        )
      : findCanonicalRecordField({
          recordFields: currentRecordFields,
          fieldMetadataItemId: fieldMetadataId,
        });

    const noExistingRecordField = !isDefined(correspondingRecordField);

    if (noExistingRecordField) {
      const recordFieldToUpsert: RecordField = {
        id: v4(),
        fieldMetadataItemId: fieldMetadataId,
        size: 100,
        isVisible: shouldShowFieldMetadataItem,
        position: lastPosition + 1,
      };

      upsertRecordField(recordFieldToUpsert);

      await saveViewFields([mapRecordFieldToViewField(recordFieldToUpsert)]);
    } else {
      updateRecordField(correspondingRecordField.id, {
        isVisible: shouldShowFieldMetadataItem,
      });

      const updatedRecordField: RecordField = {
        ...correspondingRecordField,
        isVisible: shouldShowFieldMetadataItem,
      };

      saveViewFields([mapRecordFieldToViewField(updatedRecordField)]);
    }
  };

  const addLookupRecordField = async ({
    fieldMetadataId,
    relationTargetFieldMetadataId,
  }: {
    fieldMetadataId: string;
    relationTargetFieldMetadataId: string;
  }) => {
    const lookupRecordField = buildAddedRecordField({
      currentRecordFields,
      fieldMetadataItemId: fieldMetadataId,
      relationTargetFieldMetadataId,
    });

    upsertRecordField(lookupRecordField);

    await saveViewFields([mapRecordFieldToViewField(lookupRecordField)]);
  };

  return {
    changeRecordFieldVisibility,
    addLookupRecordField,
  };
};
