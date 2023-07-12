import { useEffect } from 'react';

import { availableFiltersScopedState } from '@/lib/filters-and-sorts/states/availableFiltersScopedState';
import { FilterDefinition } from '@/lib/filters-and-sorts/types/FilterDefinition';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';

import { TableContext } from '../states/TableContext';

export function useInitializeEntityTableFilters({
  availableTableFilters,
}: {
  availableTableFilters: FilterDefinition[];
}) {
  const [, setAvailableTableFilters] = useRecoilScopedState(
    availableFiltersScopedState,
    TableContext,
  );

  useEffect(() => {
    setAvailableTableFilters(availableTableFilters);
  }, [setAvailableTableFilters, availableTableFilters]);
}
