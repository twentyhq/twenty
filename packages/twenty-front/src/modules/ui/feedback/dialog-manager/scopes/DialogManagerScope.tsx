import { ReactNode } from 'react';

import { DialogComponentInstanceContext } from '@/ui/feedback/dialog-manager/contexts/DialogComponentInstanceContext';

type DialogManagerScopeProps = {
  children: ReactNode;
  dialogComponentInstanceId: string;
};

export const DialogManagerScope = ({
  children,
  dialogComponentInstanceId,
}: DialogManagerScopeProps) => {
  return (
    <DialogComponentInstanceContext.Provider
      value={{ instanceId: dialogComponentInstanceId }}
    >
      {children}
    </DialogComponentInstanceContext.Provider>
  );
};
