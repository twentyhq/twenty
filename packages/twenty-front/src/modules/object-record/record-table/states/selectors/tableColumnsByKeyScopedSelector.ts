import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { createScopedSelector } from '@/ui/utilities/recoil-scope/utils/createScopedSelector';

import { ColumnDefinition } from '../../types/ColumnDefinition';
import { tableColumnsScopedState } from '../tableColumnsScopedState';

export const tableColumnsByKeyScopedSelector = createScopedSelector({
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
