import { ReactNode } from 'react';

import { RecoilScopeContext } from '@/types/RecoilScopeContext';
import { View } from '~/generated/graphql';

import { ViewScopeInternalContext } from './scope-internal-context/ViewScopeInternalContext';

type ViewScopeProps = {
  children: ReactNode;
  viewScopeId: string;
  canPersistViewFields?: boolean;
  defaultViewName?: string;
  onCurrentViewSubmit?: () => void | Promise<void>;
  onViewBarReset?: () => void;
  onViewCreate?: (view: View) => void | Promise<void>;
  onViewEdit?: (view: View) => void | Promise<void>;
  onViewRemove?: (viewId: string) => void | Promise<void>;
  onViewSelect?: (viewId: string) => void | Promise<void>;
  onImport?: () => void | Promise<void>;
  ViewBarRecoilScopeContext: RecoilScopeContext;
};

export const ViewScope = ({
  children,
  viewScopeId,
  canPersistViewFields,
  defaultViewName,
  onCurrentViewSubmit,
  onViewBarReset,
  onViewCreate,
  onViewEdit,
  onViewRemove,
  onViewSelect,
  onImport,
  ViewBarRecoilScopeContext,
}: ViewScopeProps) => {
  return (
    <ViewScopeInternalContext.Provider
      value={{
        scopeId: viewScopeId,
        canPersistViewFields,
        defaultViewName,
        onCurrentViewSubmit,
        onViewBarReset,
        onViewCreate,
        onViewEdit,
        onViewRemove,
        onViewSelect,
        onImport,
        ViewBarRecoilScopeContext,
      }}
    >
      {children}
    </ViewScopeInternalContext.Provider>
  );
};
