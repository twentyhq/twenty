import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { addWidgetToTab } from '@/page-layout/utils/addWidgetToTab';
import { generateDuplicatedTimestamps } from '@/page-layout/utils/generateDuplicatedTimestamps';
import { getScrollWrapperInstanceIdFromPageLayoutId } from '@/page-layout/utils/getScrollWrapperInstanceIdFromPageLayoutId';
import { getUpdatedTabLayouts } from '@/page-layout/utils/getUpdatedTabLayouts';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useRecoilCallback } from 'recoil';
import { appendCopySuffix, isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

export const useDuplicatePageLayoutWidget = (
  pageLayoutIdFromProps?: string,
) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutDraftState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutCurrentLayoutsState = useRecoilComponentCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutId,
  );

  const setEditingWidgetId = useSetRecoilComponentState(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const { getScrollWrapperElement } = useScrollWrapperHTMLElement(
    getScrollWrapperInstanceIdFromPageLayoutId(pageLayoutId),
  );

  const duplicateWidget = useRecoilCallback(
    ({ snapshot, set }) =>
      (widgetId: string): string => {
        const pageLayoutDraft = snapshot
          .getLoadable(pageLayoutDraftState)
          .getValue();

        const allTabLayouts = snapshot
          .getLoadable(pageLayoutCurrentLayoutsState)
          .getValue();

        const sourceWidget = pageLayoutDraft.tabs
          .flatMap((tab) => tab.widgets)
          .find((widget) => widget.id === widgetId);

        if (!isDefined(sourceWidget)) {
          throw new Error(`Widget with id ${widgetId} not found`);
        }

        const sourceTab = pageLayoutDraft.tabs.find(
          (tab) => tab.id === sourceWidget.pageLayoutTabId,
        );

        if (!isDefined(sourceTab)) {
          throw new Error(
            `Tab with id ${sourceWidget.pageLayoutTabId} not found`,
          );
        }

        const newWidgetId = uuidv4();

        const clonedWidget: PageLayoutWidget = {
          ...sourceWidget,
          id: newWidgetId,
          title: appendCopySuffix(sourceWidget.title),
          ...generateDuplicatedTimestamps(),
        };

        const currentTabLayouts = allTabLayouts[sourceTab.id] || {
          desktop: [],
          mobile: [],
        };

        const sourceLayout = currentTabLayouts.desktop.find(
          (layout) => layout.i === widgetId,
        );

        if (!isDefined(sourceLayout)) {
          throw new Error(`Layout for widget ${widgetId} not found`);
        }

        const maxY = currentTabLayouts.desktop.reduce(
          (max, layout) => Math.max(max, layout.y + layout.h),
          0,
        );

        const newLayout = {
          ...sourceLayout,
          i: newWidgetId,
          y: maxY,
        };

        const updatedLayouts = getUpdatedTabLayouts(
          allTabLayouts,
          sourceTab.id,
          newLayout,
        );

        set(pageLayoutCurrentLayoutsState, updatedLayouts);

        set(pageLayoutDraftState, (prev) => ({
          ...prev,
          tabs: addWidgetToTab(prev.tabs, sourceTab.id, clonedWidget),
        }));

        setEditingWidgetId(newWidgetId);

        const { scrollWrapperElement } = getScrollWrapperElement();

        if (isDefined(scrollWrapperElement)) {
          requestAnimationFrame(() => {
            const widgetElement = scrollWrapperElement.querySelector(
              `[data-widget-id="${newWidgetId}"]`,
            );

            if (isDefined(widgetElement)) {
              widgetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
              });
            }
          });
        }

        return newWidgetId;
      },
    [
      pageLayoutCurrentLayoutsState,
      pageLayoutDraftState,
      setEditingWidgetId,
      getScrollWrapperElement,
    ],
  );

  return { duplicateWidget };
};
