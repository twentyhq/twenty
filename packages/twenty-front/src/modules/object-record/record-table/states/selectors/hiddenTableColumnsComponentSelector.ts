import { availableTableColumnsComponentState } from '@/object-record/record-table/states/availableTableColumnsComponentState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';

export const hiddenTableColumnsComponentSelector = createComponentSelector({
  key: 'hiddenTableColumnsComponentSelector',
  componentInstanceContext: RecordTableComponentInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) => {
      const tableColumns = get(
        tableColumnsComponentState.atomFamily({ instanceId }),
      );
      const availableColumns = get(
        availableTableColumnsComponentState.atomFamily({ instanceId }),
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
