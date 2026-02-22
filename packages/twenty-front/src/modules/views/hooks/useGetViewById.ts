import { useFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValueV2';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';

export const useGetViewById = (viewId: string | null) => {
  const view = useFamilySelectorValueV2(coreViewFromViewIdFamilySelector, {
    viewId: viewId ?? '',
  });

  return {
    view: viewId ? view : undefined,
  };
};
