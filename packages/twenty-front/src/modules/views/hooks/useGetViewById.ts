import { useFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValue';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';

export const useGetViewById = (viewId: string | null) => {
  const view = useFamilySelectorValue(coreViewFromViewIdFamilySelector, {
    viewId: viewId ?? '',
  });

  return {
    view: viewId ? view : undefined,
  };
};
