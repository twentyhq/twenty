import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import type { PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useUpdateCurrentWidgetConfig = (pageLayoutIdFromProps: string) => {
  const pageLayoutDraftAtom = useRecoilComponentStateCallbackStateV2(
    pageLayoutDraftComponentState,
    pageLayoutIdFromProps,
  );

  const currentlyEditingWidgetId = useRecoilComponentValueV2(
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
      const prev = store.get(pageLayoutDraftAtom);
      store.set(pageLayoutDraftAtom, {
        ...prev,
        tabs: prev.tabs.map((tab) => ({
          ...tab,
          widgets: tab.widgets.map((widget) =>
            widget.id === currentlyEditingWidgetId
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
    [pageLayoutDraftAtom, currentlyEditingWidgetId, store],
  );

  return { updateCurrentWidgetConfig };
};
