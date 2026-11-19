import { useRemoveConditionalAvailabilityEditorEntry } from '@/conditional-availability/hooks/useRemoveConditionalAvailabilityEditorEntry';
import { getConditionalAvailabilityEditorItemKey } from '@/conditional-availability/utils/getConditionalAvailabilityEditorItemKey';
import { useCallback } from 'react';

export const useRemovePageLayoutWidgetConditionalAvailabilityEditorEntries =
  () => {
    const { removeConditionalAvailabilityEditorEntry } =
      useRemoveConditionalAvailabilityEditorEntry();

    const removePageLayoutWidgetConditionalAvailabilityEditorEntries =
      useCallback(
        (widgetId: string) => {
          removeConditionalAvailabilityEditorEntry(
            getConditionalAvailabilityEditorItemKey({
              metadataName: 'pageLayoutWidget',
              itemId: widgetId,
            }),
          );
        },
        [removeConditionalAvailabilityEditorEntry],
      );

    return { removePageLayoutWidgetConditionalAvailabilityEditorEntries };
  };
