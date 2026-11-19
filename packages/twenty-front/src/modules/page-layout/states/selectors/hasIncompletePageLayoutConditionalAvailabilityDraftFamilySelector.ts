import { conditionalAvailabilityEditorEntriesState } from '@/conditional-availability/states/conditionalAvailabilityEditorEntriesState';
import { isConditionalAvailabilityEditorEntryIncomplete } from '@/conditional-availability/utils/isConditionalAvailabilityEditorEntryIncomplete';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { getPageLayoutConditionalAvailabilityNodesByItemKey } from '@/page-layout/utils/getPageLayoutConditionalAvailabilityNodesByItemKey';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const hasIncompletePageLayoutConditionalAvailabilityDraftFamilySelector =
  createAtomFamilySelector<boolean, string>({
    key: 'hasIncompletePageLayoutConditionalAvailabilityDraftFamilySelector',
    get:
      (pageLayoutId) =>
      ({ get }) => {
        const nodesByItemKey =
          getPageLayoutConditionalAvailabilityNodesByItemKey({
            pageLayoutDraft: get(pageLayoutDraftComponentState, {
              instanceId: pageLayoutId,
            }),
          });

        return Object.entries(
          get(conditionalAvailabilityEditorEntriesState),
        ).some(
          ([itemKey, editorEntry]) =>
            itemKey in nodesByItemKey &&
            isConditionalAvailabilityEditorEntryIncomplete({
              editorEntry,
              node: nodesByItemKey[itemKey],
            }),
        );
      },
  });
