import { ComponentStateKey, createScopeInternalContext } from 'twenty-ui';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';

import { ColumnDefinition } from '../../types/ColumnDefinition';

type RecordTableScopeInternalContextProps = ComponentStateKey & {
  onColumnsChange: (columns: ColumnDefinition<FieldMetadata>[]) => void;
};

export const RecordTableScopeInternalContext =
  createScopeInternalContext<RecordTableScopeInternalContextProps>();
