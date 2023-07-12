import { Context } from 'react';
import { produce } from 'immer';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';

import { filtersScopedState } from '../states/filtersScopedState';
import { Filter } from '../types/Filter';

export function useUpsertFilter(context: Context<string | null>) {
  const [, setFilters] = useRecoilScopedState(filtersScopedState, context);

  return function upsertFilter(filterToUpsert: Filter) {
    setFilters((filters) => {
      return produce(filters, (filtersDraft) => {
        const index = filtersDraft.findIndex(
          (filter) => filter.field === filterToUpsert.field,
        );

        if (index === -1) {
          filtersDraft.push(filterToUpsert);
        } else {
          filtersDraft[index] = filterToUpsert;
        }
      });
    });
  };
}
