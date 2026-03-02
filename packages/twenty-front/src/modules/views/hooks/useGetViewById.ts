import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';

export const useGetViewById = (viewId: string | null) => {
  const view = useAtomFamilySelectorValue(coreViewFromViewIdFamilySelector, {
    viewId: viewId ?? '',
  });

  return {
    view: viewId ? view : undefined,
  };
};
