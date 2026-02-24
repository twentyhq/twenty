import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useUpdatePageLayoutWidget = (pageLayoutIdFromProps?: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutDraftState = useRecoilComponentStateCallbackStateV2(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const updatePageLayoutWidget = useCallback(
    (widgetId: string, updates: Partial<PageLayoutWidget>) => {
      store.set(pageLayoutDraftState, (prev) => ({
        ...prev,
        tabs: prev.tabs.map((tab) => ({
          ...tab,
          widgets: tab.widgets.map((widget) =>
            widget.id === widgetId ? { ...widget, ...updates } : widget,
          ),
        })),
      }));
    },
    [pageLayoutDraftState, store],
  );

  return { updatePageLayoutWidget };
};
