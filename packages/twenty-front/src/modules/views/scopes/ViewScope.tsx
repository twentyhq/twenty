import { ReactNode } from 'react';

import { GraphQLView } from '@/views/types/GraphQLView';

import { ViewScopeInitEffect } from './init-effect/ViewScopeInitEffect';
import { ViewScopeInternalContext } from './scope-internal-context/ViewScopeInternalContext';

type ViewScopeProps = {
  children: ReactNode;
  viewScopeId: string;
  onCurrentViewChange: (view: GraphQLView | undefined) => void | Promise<void>;
};

export const ViewScope = ({
  children,
  viewScopeId,
  onCurrentViewChange,
}: ViewScopeProps) => {
  return (
    <ViewScopeInternalContext.Provider
      value={{
        scopeId: viewScopeId,
      }}
    >
      <ViewScopeInitEffect
        viewScopeId={viewScopeId}
        onCurrentViewChange={onCurrentViewChange}
      />
      {children}
    </ViewScopeInternalContext.Provider>
  );
};
