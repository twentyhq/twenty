import { ReactNode } from 'react';

import { RecordBoardScopeInternalContext } from '@/object-record/record-board/scopes/scope-internal-context/RecordBoardScopeInternalContext';

type RecordBoardScopeProps = {
  children: ReactNode;
  recordBoardScopeId: string;
};

export const RecordBoardScope = ({
  children,
  recordBoardScopeId,
}: RecordBoardScopeProps) => {
  return (
    <RecordBoardScopeInternalContext.Provider
      value={{
        scopeId: recordBoardScopeId,
      }}
    >
      {children}
    </RecordBoardScopeInternalContext.Provider>
  );
};
