import { useView } from '@/views/hooks/useView';

export const useRemoveFilter = () => {
  const { setCurrentViewFilters } = useView();

  const removeFilter = (filterKey: string) => {
    setCurrentViewFilters?.((filters) => {
      return filters.filter((filter) => {
        return filter.key !== filterKey;
      });
    });
  };

  return removeFilter;
};
