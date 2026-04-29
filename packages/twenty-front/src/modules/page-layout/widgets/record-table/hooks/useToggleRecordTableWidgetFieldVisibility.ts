import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseToggleRecordTableWidgetFieldVisibilityParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useToggleRecordTableWidgetFieldVisibility = ({
  pageLayoutId,
  widgetId,
}: UseToggleRecordTableWidgetFieldVisibilityParams) => {
  const recordTableWidgetViewDraftState = useAtomComponentStateCallbackState(
    recordTableWidgetViewDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const toggleRecordTableWidgetFieldVisibility = useCallback(
    (viewFieldId: string, isVisible: boolean) => {
      store.set(recordTableWidgetViewDraftState, (prev) => {
        const widgetViewDraft = prev[widgetId];

        if (!isDefined(widgetViewDraft)) {
          return prev;
        }

        return {
          ...prev,
          [widgetId]: {
            ...widgetViewDraft,
            viewFields: widgetViewDraft.viewFields.map((field) =>
              field.id === viewFieldId ||
              field.clientRecordFieldId === viewFieldId
                ? { ...field, isVisible }
                : field,
            ),
          },
        };
      });
    },
    [store, recordTableWidgetViewDraftState, widgetId],
  );

  return { toggleRecordTableWidgetFieldVisibility };
};
