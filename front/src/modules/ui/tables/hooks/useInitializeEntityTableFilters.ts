import { useEffect } from 'react';

import { availableTableFiltersScopedState } from '@/filters-and-sorts/states/availableTableFiltersScopedState';
import { TableFilterDefinition } from '@/filters-and-sorts/types/TableFilterDefinition';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';

import { TableContext } from '../states/TableContext';

export function useInitializeEntityTableFilters({
  availableTableFilters,
}: {
  availableTableFilters: TableFilterDefinition[];
}) {
  const [, setAvailableTableFilters] = useRecoilScopedState(
    availableTableFiltersScopedState,
    TableContext,
  );

  useEffect(() => {
    setAvailableTableFilters(availableTableFilters);
  }, [setAvailableTableFilters, availableTableFilters]);
}
