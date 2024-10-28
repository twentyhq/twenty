import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';

import { ComponentStateKeyV2 } from '@/ui/utilities/state/component-state/types/ComponentStateKeyV2';
import { createComponentInstanceContext } from '@/ui/utilities/state/component-state/utils/createComponentInstanceContext';
import { ColumnDefinition } from '../../types/ColumnDefinition';

// TODO: separate scope contexts from event contexts
type RecordTableScopeInternalContextProps = ComponentStateKeyV2 & {
  onColumnsChange: (columns: ColumnDefinition<FieldMetadata>[]) => void;
};

export const RecordTableScopeInternalContext =
  createComponentInstanceContext<RecordTableScopeInternalContextProps>();
