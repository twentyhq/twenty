import { useEffect } from 'react';

import { availableTableFiltersScopedState } from '@/filters-and-sorts/states/availableTableFiltersScopedState';
import { EntityFilter } from '@/filters-and-sorts/types/EntityFilter';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';

import { TableContext } from '../states/TableContext';

export function useInitializeEntityTableFilters({
  availableFilters,
}: {
  availableFilters: EntityFilter[];
}) {
  const [, setAvailableFilters] = useRecoilScopedState(
    availableTableFiltersScopedState,
    TableContext,
  );

  useEffect(() => {
    setAvailableFilters(availableFilters);
  }, [setAvailableFilters, availableFilters]);
}
