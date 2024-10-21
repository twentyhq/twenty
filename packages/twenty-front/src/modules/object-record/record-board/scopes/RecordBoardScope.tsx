import { ReactNode } from 'react';

import { RecordBoardScopeInternalContext } from '@/object-record/record-board/scopes/scope-internal-context/RecordBoardScopeInternalContext';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';

type RecordBoardScopeProps = {
  children: ReactNode;
  recordBoardScopeId: string;
  onFieldsChange: (fields: FieldDefinition<FieldMetadata>[]) => void;
  onColumnsChange: (column: RecordGroupDefinition[]) => void;
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
