import { selectorFamily } from 'recoil';

import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';

import { ColumnDefinition } from '../../types/ColumnDefinition';
import { tableColumnsScopedState } from '../tableColumnsScopedState';

export const tableColumnsByKeyScopedSelector = selectorFamily({
  key: 'tableColumnsByKeyScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) =>
      get(tableColumnsScopedState({ scopeId })).reduce<
        Record<string, ColumnDefinition<FieldMetadata>>
      >(
        (result, column) => ({ ...result, [column.fieldMetadataId]: column }),
        {},
      ),
});
