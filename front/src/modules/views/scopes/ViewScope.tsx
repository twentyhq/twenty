import { ReactNode } from 'react';

import { ViewScopeInternalContext } from './scope-internal-context/ViewScopeInternalContext';

type ViewScopeProps = {
  children: ReactNode;
  viewScopeId: string;
};

export const ViewScope = ({ children, viewScopeId }: ViewScopeProps) => {
  return (
    <ViewScopeInternalContext.Provider value={{ scopeId: viewScopeId }}>
      {children}
    </ViewScopeInternalContext.Provider>
  );
};
