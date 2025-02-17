import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useRecoilCallback } from 'recoil';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useSetTableColumns = (recordTableId?: string) => {
  const tableColumnsState = useRecoilComponentCallbackStateV2(
    tableColumnsComponentState,
    recordTableId,
  );

  const setTableColumns = useRecoilCallback(
    ({ snapshot, set }) =>
      (columns: ColumnDefinition<FieldMetadata>[]) => {
        const tableColumns = getSnapshotValue(snapshot, tableColumnsState);

        if (isDeeplyEqual(tableColumns, columns)) {
          return;
        }
        set(tableColumnsState, columns);
      },
    [tableColumnsState],
  );

  return { setTableColumns };
};
