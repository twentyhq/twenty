import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const availableFieldDefinitionsComponentState = createComponentStateV2<
  ColumnDefinition<FieldMetadata>[]
>({
  key: 'availableFieldDefinitionsComponentState',
  defaultValue: [],
  componentInstanceContext: ViewComponentInstanceContext,
});
