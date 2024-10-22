import { ReactNode } from 'react';

import { RecordBoardScopeInternalContext } from '@/object-record/record-board/scopes/scope-internal-context/RecordBoardScopeInternalContext';
import { RecordBoardColumnDefinition } from '@/object-record/record-board/types/RecordBoardColumnDefinition';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';

type RecordBoardScopeProps = {
  children: ReactNode;
  recordBoardScopeId: string;
  onFieldsChange: (fields: FieldDefinition<FieldMetadata>[]) => void;
  onColumnsChange: (column: RecordBoardColumnDefinition[]) => void;
};

/** @deprecated  */
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
