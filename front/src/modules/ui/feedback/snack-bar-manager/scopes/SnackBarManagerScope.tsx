import { ReactNode } from 'react';

import { SnackBarManagerScopeInternalContext } from './scope-internal-context/SnackBarManagerScopeInternalContext';

type SnackBarManagerScopeProps = {
  children: ReactNode;
  snackBarManagerScopeId: string;
};

export const SnackBarManagerScope = ({
  children,
  snackBarManagerScopeId,
}: SnackBarManagerScopeProps) => {
  return (
    <SnackBarManagerScopeInternalContext.Provider
      value={{
        scopeId: snackBarManagerScopeId,
      }}
    >
      {children}
    </SnackBarManagerScopeInternalContext.Provider>
  );
};
