import { availableTableColumnsStateScopeMap } from '@/object-record/record-table/states/availableTableColumnsStateScopeMap';
import { tableColumnsStateScopeMap } from '@/object-record/record-table/states/tableColumnsStateScopeMap';
import { createSelectorReadOnlyScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorReadOnlyScopeMap';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';

export const hiddenTableColumnsSelectorScopeMap =
  createSelectorReadOnlyScopeMap({
    key: 'hiddenTableColumnsSelectorScopeMap',
    get:
      ({ scopeId }) =>
      ({ get }) => {
        const tableColumns = get(tableColumnsStateScopeMap({ scopeId }));
        const availableColumns = get(
          availableTableColumnsStateScopeMap({ scopeId }),
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
