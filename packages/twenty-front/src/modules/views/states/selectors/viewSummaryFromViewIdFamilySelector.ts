import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { viewSummariesSelector } from '@/views/states/selectors/viewSummariesSelector';
import { type ViewSummary } from '@/views/types/ViewSummary';

export const viewSummaryFromViewIdFamilySelector = createAtomFamilySelector<
  ViewSummary | undefined,
  { viewId: string }
>({
  key: 'viewSummaryFromViewIdFamilySelector',
  get:
    ({ viewId }) =>
    ({ get }) =>
      get(viewSummariesSelector).find((view) => view.id === viewId),
});
