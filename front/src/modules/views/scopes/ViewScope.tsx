import { ReactNode } from 'react';

import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import { Filter } from '@/views/components/view-bar/types/Filter';
import { Sort } from '@/views/components/view-bar/types/Sort';

import { ViewScopeInitEffect } from './init-effect/ViewScopeInitEffect';
import { ViewScopeInternalContext } from './scope-internal-context/ViewScopeInternalContext';

type ViewScopeProps = {
  children: ReactNode;
  viewScopeId: string;
  onViewSortsChange?: (sorts: Sort[]) => void | Promise<void>;
  onViewFiltersChange?: (filters: Filter[]) => void | Promise<void>;
  onViewFieldsChange?: (
    fields: ColumnDefinition<FieldMetadata>[],
  ) => void | Promise<void>;
};

export const ViewScope = ({
  children,
  viewScopeId,
  onViewSortsChange,
  onViewFiltersChange,
  onViewFieldsChange,
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
      />
      {children}
    </ViewScopeInternalContext.Provider>
  );
};
