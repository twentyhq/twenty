import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useEnsureObjectViewsLoaded } from '@/views/hooks/useEnsureObjectViewsLoaded';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { viewSummaryFromViewIdFamilySelector } from '@/views/states/selectors/viewSummaryFromViewIdFamilySelector';

export const useViewById = (viewId: string | null) => {
  const viewSummary = useAtomFamilySelectorValue(
    viewSummaryFromViewIdFamilySelector,
    { viewId: viewId ?? '' },
  );

  useEnsureObjectViewsLoaded([viewSummary?.objectMetadataId]);

  const view = useAtomFamilySelectorValue(viewFromViewIdFamilySelector, {
    viewId: viewId ?? '',
  });

  return {
    view: viewId ? view : undefined,
  };
};
