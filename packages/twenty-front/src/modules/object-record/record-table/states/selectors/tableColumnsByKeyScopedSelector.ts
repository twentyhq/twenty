import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { createSelectorScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorScopeMap';

import { ColumnDefinition } from '../../types/ColumnDefinition';
import { tableColumnsScopedState } from '../tableColumnsScopedState';

export const tableColumnsByKeyScopedSelector = createSelectorScopeMap({
  key: 'tableColumnsByKeyScopedSelector',
  get:
    ({ scopeId }) =>
    ({ get }) =>
      get(tableColumnsScopedState({ scopeId })).reduce<
        Record<string, ColumnDefinition<FieldMetadata>>
      >(
        (result, column) => ({ ...result, [column.fieldMetadataId]: column }),
        {},
      ),
});
