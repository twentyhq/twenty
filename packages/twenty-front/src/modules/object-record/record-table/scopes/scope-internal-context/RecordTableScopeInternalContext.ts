import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';
import { RecoilComponentStateKey } from '@/ui/utilities/state/component-state/types/RecoilComponentStateKey';

import { ColumnDefinition } from '../../types/ColumnDefinition';

// TODO: separate scope contexts from event contexts
type RecordTableScopeInternalContextProps = RecoilComponentStateKey & {
  onColumnsChange: (columns: ColumnDefinition<FieldMetadata>[]) => void;
};

export const RecordTableScopeInternalContext =
  createScopeInternalContext<RecordTableScopeInternalContextProps>();
