import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { useActiveRecordTableRow } from '@/object-record/record-table/hooks/useActiveRecordTableRow';
import { useListenToSidePanelClosing } from '@/ui/layout/right-drawer/hooks/useListenToSidePanelClosing';
import { useRecoilCallback } from 'recoil';

export const RecordTableDeactivateRecordTableRowEffect = () => {
  const { deactivateRecordTableRow } = useActiveRecordTableRow();

  const checkAndDeactivate = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const isCommandMenuOpened = snapshot
          .getLoadable(isCommandMenuOpenedState)
          .getValue();

        if (!isCommandMenuOpened) {
          deactivateRecordTableRow();
        }
      },
    [deactivateRecordTableRow],
  );

  useListenToSidePanelClosing(() => setTimeout(checkAndDeactivate, 0));

  return null;
};
