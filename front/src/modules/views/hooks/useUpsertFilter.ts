import { produce } from 'immer';

import { Filter } from '@/ui/data/filter/types/Filter';
import { useView } from '@/views/hooks/useView';

export const useUpsertFilter = () => {
  const { setCurrentViewFilters } = useView();

  const upsertFilter = (filterToUpsert: Filter) => {
    setCurrentViewFilters?.((filters) => {
      return produce(filters, (filtersDraft) => {
        const existingFilterIndex = filtersDraft.findIndex(
          (filter) => filter.fieldId === filterToUpsert.fieldId,
        );

        if (existingFilterIndex !== -1) {
          filtersDraft.push(filterToUpsert);
          return filtersDraft;
        }

        const existingFilter = filtersDraft[existingFilterIndex];

        filtersDraft[existingFilterIndex] = {
          ...filterToUpsert,
          id: existingFilter.id,
        };

        return filtersDraft;
      });
    });
  };

  return upsertFilter;
};
