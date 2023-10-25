import { ReactNode } from 'react';

import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import { Filter } from '@/ui/data/view-bar/types/Filter';
import { Sort } from '@/ui/data/view-bar/types/Sort';

import { ViewScopeInternalContext } from './scope-internal-context/ViewScopeInternalContext';

type ViewScopeProps = {
  children: ReactNode;
  viewScopeId: string;
  defaultViewName?: string;
  onViewSortsChange?: (sorts: Sort[]) => void | Promise<void>;
  onViewFiltersChange?: (filters: Filter[]) => void | Promise<void>;
  onViewFieldsChange?: (fields: FieldMetadata[]) => void | Promise<void>;
  onImport?: () => void | Promise<void>;
};

export const ViewScope = ({
  children,
  viewScopeId,
  defaultViewName,
  onViewSortsChange,
  onViewFiltersChange,
  onViewFieldsChange,
  onImport,
}: ViewScopeProps) => {
  return (
    <ViewScopeInternalContext.Provider
      value={{
        scopeId: viewScopeId,
        defaultViewName,
        onViewSortsChange,
        onViewFiltersChange,
        onViewFieldsChange,
        onImport,
      }}
    >
      {children}
    </ViewScopeInternalContext.Provider>
  );
};
