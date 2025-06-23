import { useActiveRecordTableRow } from '@/object-record/record-table/hooks/useActiveRecordTableRow';
import { useListenToSidePanelClosing } from '@/ui/layout/right-drawer/hooks/useListenToSidePanelClosing';

export const RecordTableDeactivateRecordTableRowEffect = () => {
  const { deactivateRecordTableRow } = useActiveRecordTableRow();

  useListenToSidePanelClosing(() => {
    deactivateRecordTableRow();
  });

  return null;
};
