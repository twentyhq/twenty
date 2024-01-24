import { ReactNode } from 'react';

import { FieldDefinition } from '@/object-record/field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { RecordBoardScopeInternalContext } from '@/object-record/record-board/scopes/scope-internal-context/RecordBoardScopeInternalContext';
import { RecordBoardColumnDefinition } from '@/object-record/record-board/types/RecordBoardColumnDefinition';

type RecordBoardScopeProps = {
  children: ReactNode;
  recordBoardScopeId: string;
  onFieldsChange: (fields: FieldDefinition<FieldMetadata>[]) => void;
  onColumnsChange: (column: RecordBoardColumnDefinition[]) => void;
};

export const RecordBoardScope = ({
  children,
  recordBoardScopeId,
  onColumnsChange,
  onFieldsChange,
}: RecordBoardScopeProps) => {
  return (
    <RecordBoardScopeInternalContext.Provider
      value={{
        scopeId: recordBoardScopeId,
        onColumnsChange,
        onFieldsChange,
      }}
    >
      {children}
    </RecordBoardScopeInternalContext.Provider>
  );
};
