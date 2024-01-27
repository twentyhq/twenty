import { ReactNode } from 'react';

import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewSort } from '@/views/types/ViewSort';
import { ViewType } from '@/views/types/ViewType';

import { ViewField } from '../types/ViewField';

import { ViewScopeInitEffect } from './init-effect/ViewScopeInitEffect';
import { ViewScopeInternalContext } from './scope-internal-context/ViewScopeInternalContext';

type ViewScopeProps = {
  children: ReactNode;
  viewScopeId: string;
  onViewSortsChange?: (sorts: ViewSort[]) => void | Promise<void>;
  onViewFiltersChange?: (filters: ViewFilter[]) => void | Promise<void>;
  onViewFieldsChange?: (fields: ViewField[]) => void | Promise<void>;
  onViewTypeChange?: (viewType: ViewType) => void | Promise<void>;
};

export const ViewScope = ({
  children,
  viewScopeId,
  onViewSortsChange,
  onViewFiltersChange,
  onViewFieldsChange,
  onViewTypeChange,
}: ViewScopeProps) => {
  return (
    <ViewScopeInternalContext.Provider
      value={{
        scopeId: viewScopeId,
      }}
    >
      <ViewScopeInitEffect
        viewScopeId={viewScopeId}
        onViewSortsChange={onViewSortsChange}
        onViewFiltersChange={onViewFiltersChange}
        onViewFieldsChange={onViewFieldsChange}
        onViewTypeChange={onViewTypeChange}
      />
      {children}
    </ViewScopeInternalContext.Provider>
  );
};
