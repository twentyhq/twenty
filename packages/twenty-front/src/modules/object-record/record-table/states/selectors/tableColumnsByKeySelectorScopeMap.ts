import { createSelectorReadOnlyScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorReadOnlyScopeMap';

import { tableColumnsStateScopeMap } from '../tableColumnsStateScopeMap';

export const tableColumnsByKeySelectorScopeMap = createSelectorReadOnlyScopeMap(
  {
    key: 'tableColumnsByKeySelectorScopeMap',
    get:
      ({ scopeId }) =>
      ({ get }) =>
        Object.fromEntries(
          get(tableColumnsStateScopeMap({ scopeId })).map((column) => [
            column.fieldMetadataId,
            column,
          ]),
        ),
  },
);
