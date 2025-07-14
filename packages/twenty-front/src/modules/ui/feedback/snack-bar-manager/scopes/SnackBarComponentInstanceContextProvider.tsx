import { ReactNode } from 'react';

import { SnackBarComponentInstanceContext } from '@/ui/feedback/snack-bar-manager/contexts/SnackBarComponentInstanceContext';

type SnackBarComponentInstanceContextProviderProps = {
  children: ReactNode;
  snackBarComponentInstanceId: string;
};

export const SnackBarComponentInstanceContextProvider = ({
  children,
  snackBarComponentInstanceId,
}: SnackBarComponentInstanceContextProviderProps) => {
  return (
    <SnackBarComponentInstanceContext.Provider
      value={{ instanceId: snackBarComponentInstanceId }}
    >
      {children}
    </SnackBarComponentInstanceContext.Provider>
  );
};
