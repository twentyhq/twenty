import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { calculateNewPosition } from '@/favorites/utils/calculateNewPosition';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { generateDuplicatedTimestamps } from '@/page-layout/utils/generateDuplicatedTimestamps';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useRecoilCallback } from 'recoil';
import { appendCopySuffix, isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

export const useDuplicatePageLayoutTab = (pageLayoutIdFromProps?: string) => {
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

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutId(pageLayoutId);
  const setActiveTabId = useSetRecoilComponentState(
    activeTabIdComponentState,
    tabListInstanceId,
  );

  const setTabSettingsOpenTabId = useSetRecoilComponentState(
    pageLayoutTabSettingsOpenTabIdComponentState,
    pageLayoutId,
  );

  const { navigatePageLayoutCommandMenu } = useNavigatePageLayoutCommandMenu();

  const { closeCommandMenu } = useCommandMenu();

  const duplicateTab = useRecoilCallback(
    ({ snapshot, set }) =>
      (tabId: string): string => {
        const pageLayoutDraft = snapshot
          .getLoadable(pageLayoutDraftState)
          .getValue();

        const allTabLayouts = snapshot
          .getLoadable(pageLayoutCurrentLayoutsState)
          .getValue();

        const sourceTab = pageLayoutDraft.tabs.find((t) => t.id === tabId);

        if (!isDefined(sourceTab)) {
          throw new Error(`Tab with id ${tabId} not found`);
        }

        const newTabId = uuidv4();
        const widgetOldIdNewIdMap = new Map<string, string>();

        const clonedWidgets = sourceTab.widgets.map((widget) => {
          const newWidgetId = uuidv4();
          widgetOldIdNewIdMap.set(widget.id, newWidgetId);

          return {
            ...widget,
            id: newWidgetId,
            pageLayoutTabId: newTabId,
            ...generateDuplicatedTimestamps(),
          };
        });

        const sortedTabs = sortTabsByPosition(pageLayoutDraft.tabs);
        const sourceIndex = sortedTabs.findIndex((t) => t.id === tabId);

        const newTabPosition = calculateNewPosition({
          items: sortedTabs,
          destinationIndex: sourceIndex + 1,
          sourceIndex,
        });

        const newTab: PageLayoutTab = {
          ...sourceTab,
          id: newTabId,
          title: appendCopySuffix(sourceTab.title),
          position: newTabPosition,
          widgets: clonedWidgets,
          ...generateDuplicatedTimestamps(),
        };

        const sourceLayouts = allTabLayouts[tabId] ?? {
          desktop: [],
          mobile: [],
        };

        const newLayouts = {
          desktop: sourceLayouts.desktop.map((layout) => ({
            ...layout,
            i: widgetOldIdNewIdMap.get(layout.i) || layout.i,
          })),
          mobile: sourceLayouts.mobile.map((layout) => ({
            ...layout,
            i: widgetOldIdNewIdMap.get(layout.i) || layout.i,
          })),
        };

        set(pageLayoutCurrentLayoutsState, {
          ...allTabLayouts,
          [newTabId]: newLayouts,
        });

        set(pageLayoutDraftState, (prev) => ({
          ...prev,
          tabs: [...prev.tabs, newTab],
        }));

        closeCommandMenu();

        setActiveTabId(newTabId);

        setTabSettingsOpenTabId(newTabId);

        navigatePageLayoutCommandMenu({
          commandMenuPage: CommandMenuPages.PageLayoutTabSettings,
          pageTitle: newTab.title,
          focusTitleInput: true,
        });

        return newTabId;
      },
    [
      closeCommandMenu,
      navigatePageLayoutCommandMenu,
      pageLayoutCurrentLayoutsState,
      pageLayoutDraftState,
      setActiveTabId,
      setTabSettingsOpenTabId,
    ],
  );

  return { duplicateTab };
};
