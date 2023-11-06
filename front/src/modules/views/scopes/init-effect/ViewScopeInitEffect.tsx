import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { Filter } from '@/ui/object/object-filter-dropdown/types/Filter';
import { Sort } from '@/ui/object/object-sort-dropdown/types/Sort';
import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';
import { ViewField } from '@/views/types/ViewField';

type ViewScopeInitEffectProps = {
  viewScopeId: string;
  onViewSortsChange?: (sorts: Sort[]) => void | Promise<void>;
  onViewFiltersChange?: (filters: Filter[]) => void | Promise<void>;
  onViewFieldsChange?: (fields: ViewField[]) => void | Promise<void>;
};

export const ViewScopeInitEffect = ({
  onViewSortsChange,
  onViewFiltersChange,
  onViewFieldsChange,
}: ViewScopeInitEffectProps) => {
  const {
    onViewFieldsChangeState,
    onViewFiltersChangeState,
    onViewSortsChangeState,
  } = useViewScopedStates();

  const setOnViewSortsChange = useSetRecoilState(onViewSortsChangeState);
  const setOnViewFiltersChange = useSetRecoilState(onViewFiltersChangeState);
  const setOnViewFieldsChange = useSetRecoilState(onViewFieldsChangeState);

  useEffect(() => {
    setOnViewSortsChange(() => onViewSortsChange);
    setOnViewFiltersChange(() => onViewFiltersChange);
    setOnViewFieldsChange(() => onViewFieldsChange);
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
