import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';
import { ViewField } from '@/views/types/ViewField';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewSort } from '@/views/types/ViewSort';
import { ViewType } from '@/views/types/ViewType';

type ViewScopeInitEffectProps = {
  viewScopeId: string;
  onViewSortsChange?: (sorts: ViewSort[]) => void | Promise<void>;
  onViewFiltersChange?: (filters: ViewFilter[]) => void | Promise<void>;
  onViewFieldsChange?: (fields: ViewField[]) => void | Promise<void>;
  onViewTypeChange?: (viewType: ViewType) => void | Promise<void>;
  onViewCompactModeChange?: (
    isCompactModeActive: boolean,
  ) => void | Promise<void>;
};

export const ViewScopeInitEffect = ({
  onViewSortsChange,
  onViewFiltersChange,
  onViewFieldsChange,
  onViewTypeChange,
  onViewCompactModeChange,
}: ViewScopeInitEffectProps) => {
  const {
    onViewFieldsChangeState,
    onViewFiltersChangeState,
    onViewSortsChangeState,
    onViewTypeChangeState,
    onViewCompactModeChangeState,
  } = useViewScopedStates();

  const setOnViewSortsChange = useSetRecoilState(onViewSortsChangeState);
  const setOnViewFiltersChange = useSetRecoilState(onViewFiltersChangeState);
  const setOnViewFieldsChange = useSetRecoilState(onViewFieldsChangeState);
  const setOnViewTypeChange = useSetRecoilState(onViewTypeChangeState);
  const setOnViewCompactModeChange = useSetRecoilState(
    onViewCompactModeChangeState,
  );

  useEffect(() => {
    setOnViewSortsChange(() => onViewSortsChange);
    setOnViewFiltersChange(() => onViewFiltersChange);
    setOnViewFieldsChange(() => onViewFieldsChange);
    setOnViewTypeChange(() => onViewTypeChange);
    setOnViewCompactModeChange(() => onViewCompactModeChange);
  }, [
    onViewCompactModeChange,
    onViewFieldsChange,
    onViewFiltersChange,
    onViewSortsChange,
    onViewTypeChange,
    setOnViewCompactModeChange,
    setOnViewFieldsChange,
    setOnViewFiltersChange,
    setOnViewSortsChange,
    setOnViewTypeChange,
  ]);

  return <></>;
};
