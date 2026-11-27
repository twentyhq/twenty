import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useEnsureObjectViewsLoaded } from '@/views/hooks/useEnsureObjectViewsLoaded';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';

export const useViewById = (viewId: string | null) => {
  const view = useAtomFamilySelectorValue(viewFromViewIdFamilySelector, {
    viewId: viewId ?? '',
  });

  useEnsureObjectViewsLoaded([view?.objectMetadataId]);

  return {
    view: viewId ? view : undefined,
  };
};
