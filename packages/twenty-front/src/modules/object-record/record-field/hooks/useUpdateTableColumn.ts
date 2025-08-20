import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { produce } from 'immer';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useUpdateTableColumn = (recordTableId?: string) => {
  const tableColumnsCallbackState = useRecoilComponentCallbackState(
    tableColumnsComponentState,
    recordTableId,
  );

  const updateTableColumn = useRecoilCallback(
    ({ set, snapshot }) =>
      (
        fieldMetadataItemId: string,
        partiableTableColumn: Partial<
          Pick<ColumnDefinition<any>, 'isVisible' | 'position'>
        >,
      ) => {
        const tableColumns = getSnapshotValue(
          snapshot,
          tableColumnsCallbackState,
        );

        const modifiedTableColumns = produce(
          tableColumns,
          (draftTableColumns) => {
            const indexToModify = draftTableColumns.findIndex(
              (tableColumnToFind) =>
                tableColumnToFind.fieldMetadataId === fieldMetadataItemId,
            );

            if (isDefined(partiableTableColumn.position)) {
              draftTableColumns[indexToModify].position =
                partiableTableColumn.position;
            }

            if (isDefined(partiableTableColumn.isVisible)) {
              draftTableColumns[indexToModify].isVisible =
                partiableTableColumn.isVisible;
            }
          },
        );

        set(tableColumnsCallbackState, modifiedTableColumns);
      },
    [tableColumnsCallbackState],
  );

  return {
    updateTableColumn,
  };
};
