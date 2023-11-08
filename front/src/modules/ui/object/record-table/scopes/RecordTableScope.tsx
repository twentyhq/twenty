import { ReactNode } from 'react';

import { FieldMetadata } from '../../field/types/FieldMetadata';
import { ColumnDefinition } from '../types/ColumnDefinition';

import { RecordTableScopeInternalContext } from './scope-internal-context/RecordTableScopeInternalContext';

type RecordTableScopeProps = {
  children: ReactNode;
  recordTableScopeId: string;
  onColumnsChange: (columns: ColumnDefinition<FieldMetadata>[]) => void;
  onEntityCountChange: (entityCount: number) => void;
};

export const RecordTableScope = ({
  children,
  recordTableScopeId,
  onColumnsChange,
  onEntityCountChange,
}: RecordTableScopeProps) => {
  return (
    <RecordTableScopeInternalContext.Provider
      value={{
        scopeId: recordTableScopeId,
        onColumnsChange,
        onEntityCountChange,
      }}
    >
      {children}
    </RecordTableScopeInternalContext.Provider>
  );
};
