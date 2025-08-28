import { availableTableColumnsComponentState } from '@/object-record/record-table/states/availableTableColumnsComponentState';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { produce } from 'immer';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

// TODO: remove after refactor
export const useCreateTableColumn = (recordTableId?: string) => {
  const tableColumnsCallbackState = useRecoilComponentCallbackState(
    tableColumnsComponentState,
    recordTableId,
  );

  const availableTableColumnsCallbackState = useRecoilComponentCallbackState(
    availableTableColumnsComponentState,
    recordTableId,
  );

  const createTableColumn = useRecoilCallback(
    ({ set, snapshot }) =>
      (
        fieldMetadataItemId: string,
        tableColumnToCreateInfo: Pick<
          ColumnDefinition<any>,
          'isVisible' | 'position' | 'size'
        >,
      ) => {
        const tableColumns = getSnapshotValue(
          snapshot,
          tableColumnsCallbackState,
        );

        const availableTableColumns = getSnapshotValue(
          snapshot,
          availableTableColumnsCallbackState,
        );

        const modifiedTableColumns = produce(
          tableColumns,
          (draftTableColumns) => {
            const indexToModify = draftTableColumns.findIndex(
              (tableColumnToFind) =>
                tableColumnToFind.fieldMetadataId === fieldMetadataItemId,
            );

            const correspondingAvailableTableColumn =
              availableTableColumns.find(
                (tableColumnToFind) =>
                  tableColumnToFind.fieldMetadataId === fieldMetadataItemId,
              );

            if (
              indexToModify === -1 &&
              isDefined(correspondingAvailableTableColumn)
            ) {
              draftTableColumns.push({
                ...correspondingAvailableTableColumn,
                fieldMetadataId: fieldMetadataItemId,
                position: tableColumnToCreateInfo.position,
                isVisible: tableColumnToCreateInfo.isVisible,
              });
            }
          },
        );

        set(tableColumnsCallbackState, modifiedTableColumns);
      },
    [tableColumnsCallbackState, availableTableColumnsCallbackState],
  );

  return {
    createTableColumn,
  };
};
