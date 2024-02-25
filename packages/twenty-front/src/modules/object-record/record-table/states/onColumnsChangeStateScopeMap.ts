import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const onColumnsChangeStateScopeMap = createStateScopeMap<
  ((columns: ColumnDefinition<FieldMetadata>[]) => void) | undefined
>({
  key: 'onColumnsChangeStateScopeMap',
  defaultValue: undefined,
});
