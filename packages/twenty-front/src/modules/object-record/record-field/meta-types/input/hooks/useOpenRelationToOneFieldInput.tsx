import { FieldRelationValue } from '@/object-record/record-field/types/FieldMetadata';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
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
            singleRecordPickerSelectedIdComponentState.atomFamily({
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
