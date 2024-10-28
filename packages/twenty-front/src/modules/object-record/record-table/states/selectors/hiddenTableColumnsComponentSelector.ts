import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { availableTableColumnsComponentState } from '@/object-record/record-table/states/availableTableColumnsComponentState';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';

export const hiddenTableColumnsComponentSelector = createComponentSelectorV2({
  key: 'hiddenTableColumnsComponentSelector',
  componentInstanceContext: RecordTableScopeInternalContext,
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
