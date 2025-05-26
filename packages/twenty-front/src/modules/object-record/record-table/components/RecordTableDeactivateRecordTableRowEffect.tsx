import { useActiveRecordTableRow } from '@/object-record/record-table/hooks/useActiveRecordTableRow';
import { useListenRightDrawerClose } from '@/ui/layout/right-drawer/hooks/useListenRightDrawerClose';

export const RecordTableDeactivateRecordTableRowEffect = () => {
  const { deactivateRecordTableRow } = useActiveRecordTableRow();

  useListenRightDrawerClose(() => {
    deactivateRecordTableRow();
  });

  return null;
};
