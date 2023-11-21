import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';
import { ViewField } from '@/views/types/ViewField';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewSort } from '@/views/types/ViewSort';

type ViewScopeInitEffectProps = {
  viewScopeId: string;
  onViewSortsChange?: (sorts: ViewSort[]) => void | Promise<void>;
  onViewFiltersChange?: (filters: ViewFilter[]) => void | Promise<void>;
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
