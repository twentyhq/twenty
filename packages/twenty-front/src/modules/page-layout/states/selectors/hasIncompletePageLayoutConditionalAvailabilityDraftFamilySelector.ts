import { conditionalAvailabilityEditorStatesState } from '@/conditional-availability/states/conditionalAvailabilityEditorStatesState';
import { hasIncompleteConditionalAvailabilityEditorEntry } from '@/conditional-availability/utils/hasIncompleteConditionalAvailabilityEditorEntry';
import { pageLayoutConditionalAvailabilityNodesByItemKeyFamilySelector } from '@/page-layout/states/selectors/pageLayoutConditionalAvailabilityNodesByItemKeyFamilySelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const hasIncompletePageLayoutConditionalAvailabilityDraftFamilySelector =
  createAtomFamilySelector<boolean, string>({
    key: 'hasIncompletePageLayoutConditionalAvailabilityDraftFamilySelector',
    get:
      (pageLayoutId) =>
      ({ get }) =>
        hasIncompleteConditionalAvailabilityEditorEntry({
          editorEntries: get(conditionalAvailabilityEditorStatesState),
          nodesByItemKey: get(
            pageLayoutConditionalAvailabilityNodesByItemKeyFamilySelector,
            pageLayoutId,
          ),
        }),
  });
