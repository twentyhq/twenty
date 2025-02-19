import { ReactNode } from 'react';

import { SnackBarManagerScopeInternalContext } from './scope-internal-context/SnackBarManagerScopeInternalContext';

type SnackBarProviderScopeProps = {
  children: ReactNode;
  snackBarManagerScopeId: string;
};

export const SnackBarProviderScope = ({
  children,
  snackBarManagerScopeId,
}: SnackBarProviderScopeProps) => {
  return (
    <SnackBarManagerScopeInternalContext.Provider
      value={{ scopeId: snackBarManagerScopeId }}
    >
      {children}
    </SnackBarManagerScopeInternalContext.Provider>
  );
};
