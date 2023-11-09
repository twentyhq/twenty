import { selectorFamily } from 'recoil';

import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';

import { ColumnDefinition } from '../../types/ColumnDefinition';
import { savedTableColumnsFamilyState } from '../savedTableColumnsFamilyState';

export const savedTableColumnsByKeyFamilySelector = selectorFamily({
  key: 'savedTableColumnsByKeyFamilySelector',
  get:
    (viewId: string | undefined) =>
    ({ get }) =>
      get(savedTableColumnsFamilyState(viewId)).reduce<
        Record<string, ColumnDefinition<FieldMetadata>>
      >(
        (result, column) => ({ ...result, [column.fieldMetadataId]: column }),
        {},
      ),
});
