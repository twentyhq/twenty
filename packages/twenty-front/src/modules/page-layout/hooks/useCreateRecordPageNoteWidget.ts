import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { addWidgetToTab } from '@/page-layout/utils/addWidgetToTab';
import { createDefaultStandaloneRichTextWidget } from '@/page-layout/utils/createDefaultStandaloneRichTextWidget';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { SidePanelPages } from 'twenty-shared/types';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';
import { v4 as uuidv4 } from 'uuid';

export const useCreateRecordPageNoteWidget = (pageLayoutId?: string) => {
  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutEditingWidgetIdState = useAtomComponentStateCallbackState(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const createRecordPageNoteWidget = ({
    tabId,
    positionIndex,
  }: {
    tabId: string;
    positionIndex?: number;
  }) => {
    const pageLayoutDraft = store.get(pageLayoutDraftState);
    const activeTab = pageLayoutDraft.tabs.find((tab) => tab.id === tabId);
    const widgetId = uuidv4();

    const newWidget = createDefaultStandaloneRichTextWidget({
      id: widgetId,
      pageLayoutTabId: tabId,
      body: { blocknote: '', markdown: null },
      position: {
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        index: positionIndex ?? activeTab?.widgets.length ?? 0,
      },
      title: t`Note`,
    });

    store.set(pageLayoutDraftState, (previousDraft) => ({
      ...previousDraft,
      tabs: addWidgetToTab(previousDraft.tabs, tabId, newWidget),
    }));

    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.PageLayoutWidgetSettings,
      pageTitle: t`Note`,
      resetNavigationStack: true,
    });
    store.set(pageLayoutEditingWidgetIdState, widgetId);
    return newWidget;
  };

  return { createRecordPageNoteWidget };
};
