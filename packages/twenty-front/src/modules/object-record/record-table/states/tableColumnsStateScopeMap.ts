import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

import { ColumnDefinition } from '../types/ColumnDefinition';

export const tableColumnsStateScopeMap = createStateScopeMap<
  ColumnDefinition<FieldMetadata>[]
>({
  key: 'tableColumnsStateScopeMap',
  defaultValue: [],
});
