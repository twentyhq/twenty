import { ReactNode } from 'react';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

import { RecordTableScopeInternalContext } from './scope-internal-context/RecordTableScopeInternalContext';
import { RecordTableScopeInitEffect } from './RecordTableScopeInitEffect';

type RecordTableScopeProps = {
  children: ReactNode;
  recordTableScopeId: string;
  onColumnsChange: (columns: ColumnDefinition<FieldMetadata>[]) => void;
};

export const RecordTableScope = ({
  children,
  recordTableScopeId,
  onColumnsChange,
}: RecordTableScopeProps) => {
  return (
    <RecordTableScopeInternalContext.Provider
      value={{
        scopeId: recordTableScopeId,
        onColumnsChange,
      }}
    >
      <RecordTableScopeInitEffect onColumnsChange={onColumnsChange} />
      {children}
    </RecordTableScopeInternalContext.Provider>
  );
};
