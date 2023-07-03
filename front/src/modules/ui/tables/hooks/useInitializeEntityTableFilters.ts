import { useEffect } from 'react';

import { availableFiltersScopedState } from '@/filters-and-sorts/states/availableFiltersScopedState';
import { EntityFilter } from '@/filters-and-sorts/types/EntityFilter';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';

import { TableContext } from '../states/TableContext';

export function useInitializeEntityTableFilters({
  availableFilters,
}: {
  availableFilters: EntityFilter[];
}) {
  const [, setAvailableFilters] = useRecoilScopedState(
    availableFiltersScopedState,
    TableContext,
  );

  useEffect(() => {
    setAvailableFilters(availableFilters);
  }, [setAvailableFilters, availableFilters]);
}
