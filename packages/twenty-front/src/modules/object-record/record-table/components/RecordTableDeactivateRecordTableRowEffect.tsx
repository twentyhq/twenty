import { isCommandMenuClosingState } from '@/command-menu/states/isCommandMenuClosingState';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { useActiveRecordTableRow } from '@/object-record/record-table/hooks/useActiveRecordTableRow';
import { useListenToSidePanelClosing } from '@/ui/layout/right-drawer/hooks/useListenToSidePanelClosing';
import { useRecoilCallback } from 'recoil';

export const RecordTableDeactivateRecordTableRowEffect = () => {
  const { deactivateRecordTableRow } = useActiveRecordTableRow();

  const handleSidePanelClosing = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const isCommandMenuOpened = snapshot
          .getLoadable(isCommandMenuOpenedState)
          .getValue();
        const isCommandMenuClosing = snapshot
          .getLoadable(isCommandMenuClosingState)
          .getValue();

        if (isCommandMenuOpened || isCommandMenuClosing) {
          return;
        }

        deactivateRecordTableRow();
      },
    [deactivateRecordTableRow],
  );

  useListenToSidePanelClosing(handleSidePanelClosing);

  return null;
};
