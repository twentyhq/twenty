import { isTitleCellInEditModeComponentState } from '@/object-record/record-title-cell/states/isTitleCellInEditModeComponentState';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilCallback } from 'recoil';

export const useOpenNewWorkflowTitleCell = () => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const openNewWorkflowTitleCell = useRecoilCallback(
    ({ set }) =>
      ({ recordId }: { recordId: string }) => {
        const instanceId = getRecordFieldInputInstanceId({
          recordId,
          fieldName: 'name',
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

        set(
          isTitleCellInEditModeComponentState.atomFamily({
            instanceId,
          }),
          true,
        );
      },
    [pushFocusItemToFocusStack],
  );

  return { openNewWorkflowTitleCell };
};
