import { conditionalAvailabilityEditorEntriesState } from '@/conditional-availability/states/conditionalAvailabilityEditorEntriesState';
import { getConditionalAvailabilityEditorItemKey } from '@/conditional-availability/utils/getConditionalAvailabilityEditorItemKey';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useRemovePageLayoutWidgetConditionalAvailabilityEditorEntry =
  () => {
    const store = useStore();

    const removePageLayoutWidgetConditionalAvailabilityEditorEntry =
      useCallback(
        (widgetId: string) => {
          const itemKey = getConditionalAvailabilityEditorItemKey({
            metadataName: 'pageLayoutWidget',
            itemId: widgetId,
          });

          store.set(
            conditionalAvailabilityEditorEntriesState.atom,
            (previousEditorEntries) =>
              Object.fromEntries(
                Object.entries(previousEditorEntries).filter(
                  ([entryItemKey]) => entryItemKey !== itemKey,
                ),
              ),
          );
        },
        [store],
      );

    return { removePageLayoutWidgetConditionalAvailabilityEditorEntry };
  };
