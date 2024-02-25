import { ReactNode } from 'react';

import { RecordBoardDeprecatedScopeInternalContext } from '@/object-record/record-board-deprecated/scopes/scope-internal-context/RecordBoardDeprecatedScopeInternalContext';

type RecordBoardDeprecatedScopeProps = {
  children: ReactNode;
  recordBoardScopeId: string;
};

export const RecordBoardDeprecatedScope = ({
  children,
  recordBoardScopeId,
}: RecordBoardDeprecatedScopeProps) => {
  return (
    <RecordBoardDeprecatedScopeInternalContext.Provider
      value={{
        scopeId: recordBoardScopeId,
      }}
    >
      {children}
    </RecordBoardDeprecatedScopeInternalContext.Provider>
  );
};
