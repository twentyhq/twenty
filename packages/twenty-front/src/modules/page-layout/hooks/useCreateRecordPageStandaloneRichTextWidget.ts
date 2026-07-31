import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { addWidgetToTab } from '@/page-layout/utils/addWidgetToTab';
import { createDefaultStandaloneRichTextWidget } from '@/page-layout/utils/createDefaultStandaloneRichTextWidget';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export const useCreateRecordPageStandaloneRichTextWidget = () => {
  const { tabId } = usePageLayoutContentContext();
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
  );

  const pageLayoutEditingWidgetIdState = useAtomComponentStateCallbackState(
    pageLayoutEditingWidgetIdComponentState,
  );

  const store = useStore();

  const createRecordPageStandaloneRichTextWidget = useCallback(() => {
    const activeTab = currentPageLayout.tabs.find((tab) => tab.id === tabId);
    const positionIndex = activeTab?.widgets.length ?? 0;
    const widgetId = uuidv4();

    const newWidget = createDefaultStandaloneRichTextWidget(
      widgetId,
      tabId,
      { blocknote: '', markdown: null },
      { row: 0, column: 0, rowSpan: 1, columnSpan: 12 },
      null,
      {
        __typename: 'PageLayoutWidgetVerticalListPosition',
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        index: positionIndex,
      },
    );

    store.set(pageLayoutDraftState, (prev) => ({
      ...prev,
      tabs: addWidgetToTab(prev.tabs, tabId, newWidget),
    }));

    store.set(pageLayoutEditingWidgetIdState, widgetId);
    closeSidePanelMenu();
  }, [
    closeSidePanelMenu,
    currentPageLayout.tabs,
    pageLayoutDraftState,
    pageLayoutEditingWidgetIdState,
    store,
    tabId,
  ]);

  return { createRecordPageStandaloneRichTextWidget };
};
