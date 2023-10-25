import { useEffect } from 'react';

import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import { Filter } from '@/ui/data/filter/types/Filter';
import { Sort } from '@/ui/data/sort/types/Sort';

import { useViewStates } from '../../hooks/useViewStates';

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
  const {
    setOnViewSortsChange,
    setOnViewFieldsChange,
    setOnViewFiltersChange,
  } = useViewStates(viewScopeId);

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
