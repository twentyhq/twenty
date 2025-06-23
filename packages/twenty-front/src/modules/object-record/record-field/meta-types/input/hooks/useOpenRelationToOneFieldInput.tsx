import { getRelationToOneFieldInputInstanceId } from '@/object-record/record-field/meta-types/input/utils/getRelationToOneFieldInputInstanceId';
import {
  FieldRelationToOneValue,
  FieldRelationValue,
} from '@/object-record/record-field/types/FieldMetadata';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { DropdownHotkeyScope } from '@/ui/layout/dropdown/constants/DropdownHotkeyScope';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useOpenRelationToOneFieldInput = () => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const openRelationToOneFieldInput = useRecoilCallback(
    ({ set, snapshot }) =>
      ({ fieldName, recordId }: { fieldName: string; recordId: string }) => {
        const recordPickerInstanceId = getRelationToOneFieldInputInstanceId({
          recordId,
          fieldName,
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

        pushFocusItemToFocusStack({
          focusId: recordPickerInstanceId,
          component: {
            type: FocusComponentType.OPEN_FIELD_INPUT,
            instanceId: recordPickerInstanceId,
          },
          // TODO: Remove this once we've fully migrated away from hotkey scopes
          hotkeyScope: { scope: DropdownHotkeyScope.Dropdown },
          memoizeKey: recordPickerInstanceId,
        });
      },
    [pushFocusItemToFocusStack],
  );

  return { openRelationToOneFieldInput };
};
