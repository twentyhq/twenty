import { availableTableColumnsStateScopeMap } from '@/object-record/record-table/states/availableTableColumnsStateScopeMap';
import { createSelectorReadOnlyScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorReadOnlyScopeMap';

export const availableTableColumnKeysSelectorScopeMap =
  createSelectorReadOnlyScopeMap({
    key: 'availableTableColumnKeysSelectorScopeMap',
    get:
      ({ scopeId }) =>
      ({ get }) =>
        get(availableTableColumnsStateScopeMap({ scopeId })).map(
          ({ fieldMetadataId }) => fieldMetadataId,
        ),
  });
