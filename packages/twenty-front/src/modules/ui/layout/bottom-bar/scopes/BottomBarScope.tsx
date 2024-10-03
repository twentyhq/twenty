import { ReactNode } from 'react';

import { BottomBarScopeInternalContext } from './scope-internal-context/BottomBarScopeInternalContext';

type BottomBarScopeProps = {
  children: ReactNode;
  bottomBarScopeId: string;
};

export const BottomBarScope = ({
  children,
  bottomBarScopeId,
}: BottomBarScopeProps) => {
  return (
    <BottomBarScopeInternalContext.Provider
      value={{ scopeId: bottomBarScopeId }}
    >
      {children}
    </BottomBarScopeInternalContext.Provider>
  );
};
