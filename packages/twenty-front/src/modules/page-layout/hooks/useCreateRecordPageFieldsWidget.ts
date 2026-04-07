import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { addWidgetToTab } from '@/page-layout/utils/addWidgetToTab';
import { createDefaultFieldsWidget } from '@/page-layout/utils/createDefaultFieldsWidget';
import { useCreateViewForFieldsWidget } from '@/page-layout/widgets/fields/hooks/useCreateViewForFieldsWidget';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

export const useCreateRecordPageFieldsWidget = () => {
  const { tabId } = usePageLayoutContentContext();

  const { targetObjectNameSingular } = useTargetRecord();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetObjectNameSingular,
  });

  const { currentPageLayout } = useCurrentPageLayoutOrThrow();

  const { createViewForFieldsWidget } = useCreateViewForFieldsWidget();

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
  );

  const pageLayoutEditingWidgetIdState = useAtomComponentStateCallbackState(
    pageLayoutEditingWidgetIdComponentState,
  );

  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  const store = useStore();

  const createRecordPageFieldsWidget = useCallback(async () => {
    const viewId = await createViewForFieldsWidget({
      objectMetadataId: objectMetadataItem.id,
      viewName: `${objectMetadataItem.labelSingular} Fields`,
    });

    if (viewId === null) {
      return;
    }

    const activeTab = currentPageLayout.tabs.find((tab) => tab.id === tabId);
    const positionIndex = activeTab?.widgets.length ?? 0;

    const widgetId = uuidv4();

    const newWidget = createDefaultFieldsWidget({
      id: widgetId,
      pageLayoutTabId: tabId,
      viewId,
      objectMetadataId: objectMetadataItem.id,
      positionIndex,
    });

    store.set(pageLayoutDraftState, (prev) => ({
      ...prev,
      tabs: addWidgetToTab(prev.tabs, tabId, newWidget),
    }));

    store.set(pageLayoutEditingWidgetIdState, widgetId);

    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.RecordPageFieldsSettings,
      focusTitleInput: true,
      resetNavigationStack: true,
    });
  }, [
    createViewForFieldsWidget,
    currentPageLayout.tabs,
    navigatePageLayoutSidePanel,
    objectMetadataItem.id,
    objectMetadataItem.labelSingular,
    pageLayoutDraftState,
    pageLayoutEditingWidgetIdState,
    store,
    tabId,
  ]);

  return { createRecordPageFieldsWidget };
};
