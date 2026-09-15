import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/ui/states/recordFieldInputDraftValueComponentState';
import { isTitleCellInEditModeComponentState } from '@/object-record/record-title-cell/states/isTitleCellInEditModeComponentState';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useOpenNewRecordTitleCell = () => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const store = useStore();

  const openNewRecordTitleCell = useCallback(
    ({ recordId, fieldName }: { recordId: string; fieldName: string }) => {
      const instanceId = getRecordFieldInputInstanceId({
        recordId,
        fieldName,
        prefix: RecordTitleCellContainerType.PageHeader,
      });

      pushFocusItemToFocusStack({
        focusId: instanceId,
        component: {
          type: FocusComponentType.OPENED_FIELD_INPUT,
          instanceId,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysConflictingWithKeyboard: false,
          enableGlobalHotkeysWithModifiers: false,
        },
      });

      store.set(
        isTitleCellInEditModeComponentState.atomFamily({
          instanceId,
        }),
        true,
      );

      const recordFieldValue = store.get(
        recordStoreFamilySelector.selectorFamily({ recordId, fieldName }),
      );

      store.set(
        recordFieldInputDraftValueComponentState.atomFamily({ instanceId }),
        recordFieldValue,
      );
    },
    [pushFocusItemToFocusStack, store],
  );

  return { openNewRecordTitleCell };
};
