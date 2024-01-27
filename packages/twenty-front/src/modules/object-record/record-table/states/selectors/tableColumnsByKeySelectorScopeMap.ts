import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { createSelectorReadOnlyScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorReadOnlyScopeMap';

import { tableColumnsStateScopeMap } from '../tableColumnsStateScopeMap';

export const tableColumnsByKeySelectorScopeMap = createSelectorReadOnlyScopeMap(
  {
    key: 'tableColumnsByKeySelectorScopeMap',
    get:
      ({ scopeId }) =>
      ({ get }) =>
        get(tableColumnsStateScopeMap({ scopeId })).reduce<
          Record<string, ColumnDefinition<FieldMetadata>>
        >(
          (result, column) => ({ ...result, [column.fieldMetadataId]: column }),
          {},
        ),
  },
);
