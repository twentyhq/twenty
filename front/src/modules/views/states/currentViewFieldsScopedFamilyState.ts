import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import { createScopedFamilyState } from '@/ui/utilities/recoil-scope/utils/createScopedFamilyState';

export const currentViewFieldsScopedFamilyState = createScopedFamilyState<
  ColumnDefinition<FieldMetadata>[],
  string
>({
  key: 'currentViewFieldsScopedFamilyState',
  defaultValue: [],
});
