import { ReactNode } from 'react';

import { RecordTableScopeInternalContext } from './scope-internal-context/RecordTableScopeInternalContext';

type RecordTableScopeProps = {
  children: ReactNode;
  recordTableScopeId: string;
  onColumnsChange: (columns: string[]) => void;
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
      {children}
    </RecordTableScopeInternalContext.Provider>
  );
};
