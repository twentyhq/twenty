import {
  type FieldRelationToOneValue,
  type FieldRelationValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { useSingleRecordPickerOpen } from '@/object-record/record-picker/single-record-picker/hooks/useSingleRecordPickerOpen';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useOpenRelationToOneFieldInput = () => {
  const store = useStore();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { openSingleRecordPicker } = useSingleRecordPickerOpen();

  const openRelationToOneFieldInput = useCallback(
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
      const fieldValue = store.get(
        recordStoreFamilySelector.selectorFamily({ recordId, fieldName }),
      ) as FieldRelationValue<FieldRelationToOneValue>;

      if (isDefined(fieldValue)) {
        store.set(
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
        globalHotkeysConfig: {
          enableGlobalHotkeysConflictingWithKeyboard: false,
        },
      });
    },
    [openSingleRecordPicker, pushFocusItemToFocusStack, store],
  );

  return { openRelationToOneFieldInput };
};
