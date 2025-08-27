import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { availableTableColumnsComponentState } from '@/object-record/record-table/states/availableTableColumnsComponentState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useRecoilCallback } from 'recoil';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useSetAvailableTableColumns = (
  recordTableIdFromProps?: string,
) => {
  const recordTableId = useAvailableComponentInstanceIdOrThrow(
    RecordTableComponentInstanceContext,
    recordTableIdFromProps,
  );

  const availableTableColumnsState = useRecoilComponentCallbackState(
    availableTableColumnsComponentState,
    recordTableId,
  );

  const setAvailableTableColumns = useRecoilCallback(
    ({ snapshot, set }) =>
      (columns: ColumnDefinition<FieldMetadata>[]) => {
        const availableTableColumns = getSnapshotValue(
          snapshot,
          availableTableColumnsState,
        );

        if (isDeeplyEqual(availableTableColumns, columns)) {
          return;
        }
        set(availableTableColumnsState, columns);
      },
    [availableTableColumnsState],
  );

  return {
    setAvailableTableColumns,
  };
};
