import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { createSelectorScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorScopeMap';

import { ColumnDefinition } from '../../types/ColumnDefinition';
import { tableColumnsStateScopeMap } from '../tableColumnsStateScopeMap';

export const tableColumnsByKeySelectorScopeMap = createSelectorScopeMap({
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
});
