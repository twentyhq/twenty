import { useEffect } from 'react';

import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import { Filter } from '@/ui/data/filter/types/Filter';
import { Sort } from '@/ui/data/sort/types/Sort';
import { useView } from '@/views/hooks/useView';
import { useViewInternalStates } from '@/views/hooks/useViewInternalStates';

type ViewScopeInitEffectProps = {
  viewScopeId: string;
  onViewSortsChange?: (sorts: Sort[]) => void | Promise<void>;
  onViewFiltersChange?: (filters: Filter[]) => void | Promise<void>;
  onViewFieldsChange?: (
    fields: ColumnDefinition<FieldMetadata>[],
  ) => void | Promise<void>;
};

export const ViewScopeInitEffect = ({
  viewScopeId,
  onViewSortsChange,
  onViewFiltersChange,
  onViewFieldsChange,
}: ViewScopeInitEffectProps) => {
  const { currentViewId } = useView();
  const {
    setOnViewSortsChange,
    setOnViewFieldsChange,
    setOnViewFiltersChange,
  } = useViewInternalStates(viewScopeId, currentViewId);

  useEffect(() => {
    setOnViewSortsChange(onViewSortsChange);
    setOnViewFiltersChange(onViewFiltersChange);
    setOnViewFieldsChange(onViewFieldsChange);
  }, [
    onViewFieldsChange,
    onViewFiltersChange,
    onViewSortsChange,
    setOnViewFieldsChange,
    setOnViewFiltersChange,
    setOnViewSortsChange,
  ]);

  return <></>;
};
