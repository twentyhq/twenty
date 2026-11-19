import { activeCustomizationPageLayoutIdsState } from '@/layout-customization/states/activeCustomizationPageLayoutIdsState';
import { hasIncompletePageLayoutConditionalAvailabilityDraftFamilySelector } from '@/page-layout/states/selectors/hasIncompletePageLayoutConditionalAvailabilityDraftFamilySelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const hasIncompleteLayoutCustomizationConditionalAvailabilityDraftSelector =
  createAtomSelector<boolean>({
    key: 'hasIncompleteLayoutCustomizationConditionalAvailabilityDraftSelector',
    get: ({ get }) =>
      get(activeCustomizationPageLayoutIdsState).some((pageLayoutId) =>
        get(
          hasIncompletePageLayoutConditionalAvailabilityDraftFamilySelector,
          pageLayoutId,
        ),
      ),
  });
