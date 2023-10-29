import { produce } from 'immer';

import { Filter } from '@/ui/data/filter/types/Filter';
import { useView } from '@/views/hooks/useView';

export const useUpsertFilter = () => {
  const { setCurrentViewFilters } = useView();

  const upsertFilter = (filterToUpsert: Filter) => {
    setCurrentViewFilters?.((filters) => {
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
