import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
import { useUpsertRecordField } from '@/object-record/record-field/hooks/useUpsertRecordField';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { getRecordFieldKey } from '@/object-record/record-field/utils/getRecordFieldKey';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
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

  const changeRecordFieldVisibility = async ({
    recordField,
    isVisible,
  }: {
    recordField: Pick<
      RecordField,
      'fieldMetadataItemId' | 'relationTargetFieldMetadataItemId'
    >;
    isVisible: boolean;
  }) => {
    const lastPosition =
      currentRecordFields.toSorted(sortByProperty('position', 'desc'))?.[0]
        ?.position ?? 0;

    const shouldShowFieldMetadataItem = isVisible === true;
    const recordFieldKey = getRecordFieldKey(recordField);
    const correspondingRecordField = currentRecordFields.find(
      (recordFieldToFind) =>
        getRecordFieldKey(recordFieldToFind) === recordFieldKey,
    );

    const noExistingRecordField = !isDefined(correspondingRecordField);

    if (noExistingRecordField) {
      const recordFieldToUpsert: RecordField = {
        id: v4(),
        fieldMetadataItemId: recordField.fieldMetadataItemId,
        relationTargetFieldMetadataItemId:
          recordField.relationTargetFieldMetadataItemId,
        size: 100,
        isVisible: shouldShowFieldMetadataItem,
        position: lastPosition + 1,
      };

      upsertRecordField(recordFieldToUpsert);

      await saveViewFields([mapRecordFieldToViewField(recordFieldToUpsert)]);
    } else {
      updateRecordField(recordFieldKey, {
        isVisible: shouldShowFieldMetadataItem,
      });

      const updatedRecordField: RecordField = {
        ...correspondingRecordField,
        isVisible: shouldShowFieldMetadataItem,
      };

      saveViewFields([mapRecordFieldToViewField(updatedRecordField)]);
    }
  };

  return {
    changeRecordFieldVisibility,
  };
};
