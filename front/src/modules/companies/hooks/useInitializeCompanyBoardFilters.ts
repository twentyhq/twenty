import { useEffect } from 'react';

import { CompanyBoardContext } from '@/companies/states/CompanyBoardContext';
import { availableFiltersScopedState } from '@/ui/filter-n-sort/states/availableFiltersScopedState';
import { FilterDefinition } from '@/ui/filter-n-sort/types/FilterDefinition';
import { useRecoilScopedState } from '@/ui/recoil-scope/hooks/useRecoilScopedState';

export function useInitializeCompanyBoardFilters({
  availableFilters,
}: {
  availableFilters: FilterDefinition[];
}) {
  const [, setAvailableFilters] = useRecoilScopedState(
    availableFiltersScopedState,
    CompanyBoardContext,
  );

  useEffect(() => {
    setAvailableFilters(availableFilters);
  }, [setAvailableFilters, availableFilters]);
}
