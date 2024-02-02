import { availableTableColumnsStateScopeMap } from '@/object-record/record-table/states/availableTableColumnsStateScopeMap';
import { tableColumnsByKeySelectorScopeMap } from '@/object-record/record-table/states/selectors/tableColumnsByKeySelectorScopeMap';
import { visibleTableColumnsSelectorScopeMap } from '@/object-record/record-table/states/selectors/visibleTableColumnsSelectorScopeMap';
import { createSelectorReadOnlyScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorReadOnlyScopeMap';

export const hiddenTableColumnsSelectorScopeMap =
  createSelectorReadOnlyScopeMap({
    key: 'hiddenTableColumnsSelectorScopeMap',
    get:
      ({ scopeId }) =>
      ({ get }) => {
        const columnsByKey = get(
          tableColumnsByKeySelectorScopeMap({ scopeId }),
        );
        const availableColumns = get(
          availableTableColumnsStateScopeMap({ scopeId }),
        );
        const visibleColumnKeys = get(
          visibleTableColumnsSelectorScopeMap({ scopeId }),
        ).map(({ fieldMetadataId }) => fieldMetadataId);

        const hiddenColumns = availableColumns
          .filter(
            ({ fieldMetadataId }) =>
              !visibleColumnKeys.includes(fieldMetadataId),
          )
          .map((availableColumn) => ({
            ...(columnsByKey[availableColumn.fieldMetadataId] ??
              availableColumn),
            isVisible: false,
          }));

        return hiddenColumns;
      },
  });
