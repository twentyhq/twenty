import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';
import { ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';

import { ColumnDefinition } from '../../types/ColumnDefinition';

// TODO: separate scope contexts from event contexts
type RecordTableScopeInternalContextProps = ComponentStateKey & {
  onColumnsChange: (columns: ColumnDefinition<FieldMetadata>[]) => void;
};

export const RecordTableScopeInternalContext =
  createScopeInternalContext<RecordTableScopeInternalContextProps>();
