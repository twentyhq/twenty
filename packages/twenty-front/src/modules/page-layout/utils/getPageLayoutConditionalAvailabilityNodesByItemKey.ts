import { getConditionalAvailabilityEditorItemKey } from '@/conditional-availability/utils/getConditionalAvailabilityEditorItemKey';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type ConditionalAvailabilityNode } from 'twenty-shared/types';

export const getPageLayoutConditionalAvailabilityNodesByItemKey = ({
  pageLayoutDraft,
}: {
  pageLayoutDraft: Pick<DraftPageLayout, 'tabs'>;
}): Record<string, ConditionalAvailabilityNode | null> => {
  const nodesByItemKey: Record<string, ConditionalAvailabilityNode | null> = {};

  for (const tab of pageLayoutDraft.tabs) {
    if (!tab.isActive) {
      continue;
    }

    for (const widget of tab.widgets) {
      if (!widget.isActive) {
        continue;
      }

      nodesByItemKey[
        getConditionalAvailabilityEditorItemKey({
          metadataName: 'pageLayoutWidget',
          itemId: widget.id,
        })
      ] = widget.conditionalAvailability ?? null;
    }
  }

  return nodesByItemKey;
};
