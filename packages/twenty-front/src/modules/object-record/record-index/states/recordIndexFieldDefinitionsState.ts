import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexFieldDefinitionsState = createAtomComponentState<
  ColumnDefinition<FieldMetadata>[]
>({
  key: 'recordIndexFieldDefinitionsState',
  defaultValue: [],
  componentInstanceContext: ViewComponentInstanceContext,
});
