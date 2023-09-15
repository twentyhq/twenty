import { Context } from 'react';
import { produce } from 'immer';

import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { filtersScopedState } from '../states/filtersScopedState';
import { Filter } from '../types/Filter';

export const useUpsertFilter = (context: Context<string | null>) => {
  const [, setFilters] = useRecoilScopedState(filtersScopedState, context);

  const upsertFilter = (filterToUpsert: Filter) => {
    setFilters((filters) => {
      return produce(filters, (filtersDraft) => {
        const index = filtersDraft.findIndex(
          (filter) => filter.key === filterToUpsert.key,
        );

        if (index === -1) {
          filtersDraft.push(filterToUpsert);
        } else {
          filtersDraft[index] = filterToUpsert;
        }
      });
    });
  };

  return upsertFilter;
};
