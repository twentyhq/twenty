import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import type { PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilCallback } from 'recoil';

export const useUpdateCurrentWidgetConfig = (pageLayoutIdFromProps: string) => {
  const pageLayoutDraftCallbackState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutIdFromProps,
  );

  const currentlyEditingWidgetId = useRecoilComponentValue(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutIdFromProps,
  );

  const updateCurrentWidgetConfig = useRecoilCallback(
    ({ set }) =>
      ({
        objectMetadataId,
        configToUpdate,
      }: {
        objectMetadataId?: string | null;
        configToUpdate?: Partial<PageLayoutWidget['configuration']>;
      }) => {
        set(pageLayoutDraftCallbackState, (prev) => ({
          ...prev,
          tabs: prev.tabs.map((tab) => ({
            ...tab,
            widgets: tab.widgets.map((widget) =>
              widget.id === currentlyEditingWidgetId
                ? {
                    ...widget,
                    objectMetadataId:
                      objectMetadataId ?? widget.objectMetadataId,
                    configuration: {
                      ...(widget.configuration ?? {}),
                      ...configToUpdate,
                    } as PageLayoutWidget['configuration'],
                  }
                : widget,
            ),
          })),
        }));
      },
    [pageLayoutDraftCallbackState, currentlyEditingWidgetId],
  );

  return { updateCurrentWidgetConfig };
};
