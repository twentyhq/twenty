import { useEffect } from 'react';

import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { availableFiltersScopedState } from '@/ui/view-bar/states/availableFiltersScopedState';
import { FilterDefinition } from '@/ui/view-bar/types/FilterDefinition';

import { TasksRecoilScopeContext } from '../../states/recoil-scope-contexts/TasksRecoilScopeContext';

export function useInitializeTasksFilters({
  availableFilters,
}: {
  availableFilters: FilterDefinition[];
}) {
  const [, setAvailableFilters] = useRecoilScopedState(
    availableFiltersScopedState,
    TasksRecoilScopeContext,
  );

  useEffect(() => {
    setAvailableFilters(availableFilters);
  }, [setAvailableFilters, availableFilters]);
}
