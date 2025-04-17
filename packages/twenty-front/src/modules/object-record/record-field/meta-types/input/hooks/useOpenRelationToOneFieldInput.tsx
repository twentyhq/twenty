import {
  FieldRelationToOneValue,
  FieldRelationValue,
} from '@/object-record/record-field/types/FieldMetadata';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { SingleRecordPickerHotkeyScope } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerHotkeyScope';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useOpenRelationToOneFieldInput = () => {
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const openRelationToOneFieldInput = useRecoilCallback(
    ({ set, snapshot }) =>
      ({ fieldName, recordId }: { fieldName: string; recordId: string }) => {
        const recordPickerInstanceId = `relation-to-one-field-input-${recordId}-${fieldName}`;
        const fieldValue = snapshot
          .getLoadable<FieldRelationValue<FieldRelationToOneValue>>(
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

        setHotkeyScopeAndMemorizePreviousScope(
          SingleRecordPickerHotkeyScope.SingleRecordPicker,
        );
      },
    [setHotkeyScopeAndMemorizePreviousScope],
  );

  return { openRelationToOneFieldInput };
};
