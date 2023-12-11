import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { ScopedStateKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/ScopedStateKey';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';

import { ColumnDefinition } from '../../types/ColumnDefinition';

type RecordTableScopeInternalContextProps = ScopedStateKey & {
  onColumnsChange: (columns: ColumnDefinition<FieldMetadata>[]) => void;
};

export const RecordTableScopeInternalContext =
  createScopeInternalContext<RecordTableScopeInternalContextProps>();
