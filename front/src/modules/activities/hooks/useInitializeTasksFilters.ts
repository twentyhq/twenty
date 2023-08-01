import { useEffect } from 'react';

import { availableFiltersScopedState } from '@/ui/filter-n-sort/states/availableFiltersScopedState';
import { FilterDefinition } from '@/ui/filter-n-sort/types/FilterDefinition';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { TasksContext } from '../states/TasksContext';

export function useInitializeTasksFilters({
  availableFilters,
}: {
  availableFilters: FilterDefinition[];
}) {
  const [, setAvailableFilters] = useRecoilScopedState(
    availableFiltersScopedState,
    TasksContext,
  );

  useEffect(() => {
    setAvailableFilters(availableFilters);
  }, [setAvailableFilters, availableFilters]);
}
