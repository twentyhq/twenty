import { useEffect } from 'react';

import { availableFiltersScopedState } from '@/lib/filters-and-sorts/states/availableFiltersScopedState';
import { FilterDefinition } from '@/lib/filters-and-sorts/types/FilterDefinition';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';

import { TableContext } from '../states/TableContext';

export function useInitializeEntityTableFilters({
  availableFilters,
}: {
  availableFilters: FilterDefinition[];
}) {
  const [, setAvailableFilters] = useRecoilScopedState(
    availableFiltersScopedState,
    TableContext,
  );

  useEffect(() => {
    setAvailableFilters(availableFilters);
  }, [setAvailableFilters, availableFilters]);
}
