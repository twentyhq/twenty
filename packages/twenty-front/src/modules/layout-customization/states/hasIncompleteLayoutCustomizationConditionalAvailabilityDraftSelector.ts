import { conditionalAvailabilityEditorStatesState } from '@/conditional-availability/states/conditionalAvailabilityEditorStatesState';
import { hasIncompleteConditionalAvailabilityEditorEntry } from '@/conditional-availability/utils/hasIncompleteConditionalAvailabilityEditorEntry';
import { activeCustomizationPageLayoutIdsState } from '@/layout-customization/states/activeCustomizationPageLayoutIdsState';
import { pageLayoutConditionalAvailabilityNodesByItemKeyFamilySelector } from '@/page-layout/states/selectors/pageLayoutConditionalAvailabilityNodesByItemKeyFamilySelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type ConditionalAvailabilityNode } from 'twenty-shared/types';

export const hasIncompleteLayoutCustomizationConditionalAvailabilityDraftSelector =
  createAtomSelector<boolean>({
    key: 'hasIncompleteLayoutCustomizationConditionalAvailabilityDraftSelector',
    get: ({ get }) => {
      const nodesByItemKey: Record<string, ConditionalAvailabilityNode | null> =
        {};

      for (const pageLayoutId of get(activeCustomizationPageLayoutIdsState)) {
        Object.assign(
          nodesByItemKey,
          get(
            pageLayoutConditionalAvailabilityNodesByItemKeyFamilySelector,
            pageLayoutId,
          ),
        );
      }

      return hasIncompleteConditionalAvailabilityEditorEntry({
        editorEntries: get(conditionalAvailabilityEditorStatesState),
        nodesByItemKey,
      });
    },
  });
