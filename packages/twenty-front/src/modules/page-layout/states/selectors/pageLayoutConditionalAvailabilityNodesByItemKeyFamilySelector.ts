import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { getPageLayoutConditionalAvailabilityNodesByItemKey } from '@/page-layout/utils/getPageLayoutConditionalAvailabilityNodesByItemKey';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { type ConditionalAvailabilityNode } from 'twenty-shared/types';

export const pageLayoutConditionalAvailabilityNodesByItemKeyFamilySelector =
  createAtomFamilySelector<
    Record<string, ConditionalAvailabilityNode | null>,
    string
  >({
    key: 'pageLayoutConditionalAvailabilityNodesByItemKeyFamilySelector',
    get:
      (pageLayoutId) =>
      ({ get }) =>
        getPageLayoutConditionalAvailabilityNodesByItemKey({
          pageLayoutDraft: get(pageLayoutDraftComponentState, {
            instanceId: pageLayoutId,
          }),
        }),
  });
