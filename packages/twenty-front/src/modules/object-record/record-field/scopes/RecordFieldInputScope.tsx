import { ReactNode } from 'react';

import { RecordFieldInputScopeInternalContext } from '@/object-record/record-field/scopes/scope-internal-context/RecordFieldInputScopeInternalContext';

type RecordFieldInputScopeProps = {
  children: ReactNode;
  recordFieldInputScopeId: string;
};

export const RecordFieldInputScope = ({
  children,
  recordFieldInputScopeId,
}: RecordFieldInputScopeProps) => {
  return (
    <RecordFieldInputScopeInternalContext.Provider
      value={{ scopeId: recordFieldInputScopeId }}
    >
      {children}
    </RecordFieldInputScopeInternalContext.Provider>
  );
};
