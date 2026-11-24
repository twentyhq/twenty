import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import type { PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useUpdateCurrentWidgetConfig = (pageLayoutIdFromProps: string) => {
  const pageLayoutDraft = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutIdFromProps,
  );

  const pageLayoutEditingWidgetId = useAtomComponentStateValue(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutIdFromProps,
  );

  const store = useStore();

  const updateCurrentWidgetConfig = useCallback(
    ({
      objectMetadataId,
      configToUpdate,
    }: {
      objectMetadataId?: string | null;
      configToUpdate?: Partial<PageLayoutWidget['configuration']>;
    }) => {
      const prev = store.get(pageLayoutDraft);
      store.set(pageLayoutDraft, {
        ...prev,
        tabs: prev.tabs.map((tab) => ({
          ...tab,
          widgets: tab.widgets.map((widget) =>
            widget.id === pageLayoutEditingWidgetId
              ? {
                  ...widget,
                  objectMetadataId: objectMetadataId ?? widget.objectMetadataId,
                  configuration: {
                    ...(widget.configuration ?? {}),
                    ...configToUpdate,
                  } as PageLayoutWidget['configuration'],
                }
              : widget,
          ),
        })),
      });
    },
    [pageLayoutDraft, pageLayoutEditingWidgetId, store],
  );

  return { updateCurrentWidgetConfig };
};
