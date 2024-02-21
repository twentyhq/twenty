import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { StateScopeMapKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/StateScopeMapKey';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';

import { ColumnDefinition } from '../../types/ColumnDefinition';

type RecordTableScopeInternalContextProps = StateScopeMapKey & {
  onColumnsChange: (columns: ColumnDefinition<FieldMetadata>[]) => void;
};

export const RecordTableScopeInternalContext =
  createScopeInternalContext<RecordTableScopeInternalContextProps>();
