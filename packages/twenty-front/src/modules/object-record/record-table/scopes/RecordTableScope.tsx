import { ReactNode } from 'react';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

import { RecordTableScopeInitEffect } from './RecordTableScopeInitEffect';
import { RecordTableScopeInternalContext } from './scope-internal-context/RecordTableScopeInternalContext';

type RecordTableScopeProps = {
  children: ReactNode;
  recordTableId: string;
  onColumnsChange: (columns: ColumnDefinition<FieldMetadata>[]) => void;
};

export const RecordTableScope = ({
  children,
  recordTableId,
  onColumnsChange,
}: RecordTableScopeProps) => {
  return (
    <RecordTableScopeInternalContext.Provider
      value={{
        instanceId: recordTableId,
        onColumnsChange,
      }}
    >
      <RecordTableScopeInitEffect onColumnsChange={onColumnsChange} />
      {children}
    </RecordTableScopeInternalContext.Provider>
  );
};
