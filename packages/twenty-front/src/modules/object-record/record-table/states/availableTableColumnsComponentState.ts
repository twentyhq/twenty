import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';

import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ColumnDefinition } from '../types/ColumnDefinition';

export const availableTableColumnsComponentState = createComponentStateV2<
  ColumnDefinition<FieldMetadata>[]
>({
  key: 'availableTableColumnsComponentState',
  defaultValue: [],
  componentInstanceContext: RecordTableScopeInternalContext,
});
