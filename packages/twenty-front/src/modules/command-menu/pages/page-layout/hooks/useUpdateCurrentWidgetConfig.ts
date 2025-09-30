import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilCallback } from 'recoil';
import type { PageLayoutWidget } from '~/generated/graphql';

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
                    objectMetadataId,
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
