import { ReactNode } from 'react';

import { DialogManagerScopeInternalContext } from './scope-internal-context/DialogManagerScopeInternalContext';

type DialogManagerScopeProps = {
  children: ReactNode;
  dialogManagerScopeId: string;
};

export const DialogManagerScope = ({
  children,
  dialogManagerScopeId,
}: DialogManagerScopeProps) => {
  return (
    <DialogManagerScopeInternalContext.Provider
      value={{ scopeId: dialogManagerScopeId }}
    >
      {children}
    </DialogManagerScopeInternalContext.Provider>
  );
};
