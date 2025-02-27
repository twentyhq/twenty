import { FieldRelationValue } from '@/object-record/record-field/types/FieldMetadata';
import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { SingleRecordPickerRecord } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerRecord';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared';

export const useOpenRelationToOneFieldInput = () => {
  const openRelationToOneFieldInput = useRecoilCallback(
    ({ set, snapshot }) =>
      ({ fieldName, recordId }: { fieldName: string; recordId: string }) => {
        const recordPickerInstanceId = `relation-to-one-field-input-${recordId}`;
        const fieldValue = snapshot
          .getLoadable<FieldRelationValue<SingleRecordPickerRecord>>(
            recordStoreFamilySelector({
              recordId,
              fieldName,
            }),
          )
          .getValue();

        if (isDefined(fieldValue)) {
          set(
            singleRecordPickerSearchFilterComponentState.atomFamily({
              instanceId: recordPickerInstanceId,
            }),
            fieldValue.id,
          );
        }
      },
    [],
  );

  return { openRelationToOneFieldInput };
};
