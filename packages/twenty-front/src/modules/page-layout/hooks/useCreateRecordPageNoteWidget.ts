import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { addWidgetToTab } from '@/page-layout/utils/addWidgetToTab';
import { createDefaultStandaloneRichTextWidget } from '@/page-layout/utils/createDefaultStandaloneRichTextWidget';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';
import { v4 as uuidv4 } from 'uuid';

export const useCreateRecordPageNoteWidget = () => {
  const { tabId } = usePageLayoutContentContext();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
  );

  const pageLayoutEditingWidgetIdState = useAtomComponentStateCallbackState(
    pageLayoutEditingWidgetIdComponentState,
  );

  const store = useStore();

  const createRecordPageNoteWidget = () => {
    const pageLayoutDraft = store.get(pageLayoutDraftState);
    const activeTab = pageLayoutDraft.tabs.find((tab) => tab.id === tabId);
    const widgetId = uuidv4();

    const newWidget = createDefaultStandaloneRichTextWidget(
      widgetId,
      tabId,
      { blocknote: '', markdown: null },
      {
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        index: activeTab?.widgets.length ?? 0,
      },
      null,
      t`Note`,
    );

    store.set(pageLayoutDraftState, (previousDraft) => ({
      ...previousDraft,
      tabs: addWidgetToTab(previousDraft.tabs, tabId, newWidget),
    }));

    store.set(pageLayoutEditingWidgetIdState, widgetId);
    closeSidePanelMenu();
  };

  return { createRecordPageNoteWidget };
};
