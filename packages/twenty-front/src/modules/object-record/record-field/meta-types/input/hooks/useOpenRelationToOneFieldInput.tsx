import {
  FieldRelationToOneValue,
  FieldRelationValue,
} from '@/object-record/record-field/types/FieldMetadata';
import { useSingleRecordPickerOpen } from '@/object-record/record-picker/single-record-picker/hooks/useSingleRecordPickerOpen';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { DropdownHotkeyScope } from '@/ui/layout/dropdown/constants/DropdownHotkeyScope';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useOpenRelationToOneFieldInput = () => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { openSingleRecordPicker } = useSingleRecordPickerOpen();

  const openRelationToOneFieldInput = useRecoilCallback(
    ({ set, snapshot }) =>
      ({
        fieldName,
        recordId,
        prefix,
      }: {
        fieldName: string;
        recordId: string;
        prefix?: string;
      }) => {
        const recordPickerInstanceId = getRecordFieldInputInstanceId({
          recordId,
          fieldName,
          prefix,
        });
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

        openSingleRecordPicker(recordPickerInstanceId);

        pushFocusItemToFocusStack({
          focusId: recordPickerInstanceId,
          component: {
            type: FocusComponentType.OPENED_FIELD_INPUT,
            instanceId: recordPickerInstanceId,
          },
          // TODO: Remove this once we've fully migrated away from hotkey scopes
          hotkeyScope: { scope: DropdownHotkeyScope.Dropdown },
          memoizeKey: recordPickerInstanceId,
        });
      },
    [openSingleRecordPicker, pushFocusItemToFocusStack],
  );

  return { openRelationToOneFieldInput };
};
