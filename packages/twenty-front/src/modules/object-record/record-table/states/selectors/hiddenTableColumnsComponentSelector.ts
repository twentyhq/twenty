import { availableTableColumnsComponentState } from '@/object-record/record-table/states/availableTableColumnsComponentState';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { createComponentReadOnlySelector } from '@/ui/utilities/state/component-state/utils/createComponentReadOnlySelector';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';

export const hiddenTableColumnsComponentSelector =
  createComponentReadOnlySelector({
    key: 'hiddenTableColumnsComponentSelector',
    get:
      ({ scopeId }) =>
      ({ get }) => {
        const tableColumns = get(tableColumnsComponentState({ scopeId }));
        const availableColumns = get(
          availableTableColumnsComponentState({ scopeId }),
        );
        const tableColumnsByKey = mapArrayToObject(
          tableColumns,
          ({ fieldMetadataId }) => fieldMetadataId,
        );

        const hiddenColumns = availableColumns
          .filter(
            ({ fieldMetadataId }) =>
              !tableColumnsByKey[fieldMetadataId]?.isVisible,
          )
          .map((availableColumn) => {
            const { fieldMetadataId } = availableColumn;
            const existingTableColumn = tableColumnsByKey[fieldMetadataId];

            return {
              ...(existingTableColumn || availableColumn),
              isVisible: false,
            };
          });

        return hiddenColumns;
      },
  });
