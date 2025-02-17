import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useRecoilCallback } from 'recoil';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useSetTableColumns = () => {
  const setTableColumns = useRecoilCallback(
    ({ snapshot, set }) =>
      (columns: ColumnDefinition<FieldMetadata>[], recordTableId: string) => {
        const tableColumns = getSnapshotValue(
          snapshot,
          tableColumnsComponentState.atomFamily({
            instanceId: recordTableId,
          }),
        );

        if (isDeeplyEqual(tableColumns, columns)) {
          return;
        }
        set(
          tableColumnsComponentState.atomFamily({
            instanceId: recordTableId,
          }),
          columns,
        );
      },
    [],
  );

  return { setTableColumns };
};
