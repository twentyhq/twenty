import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { widgetInsertionContextComponentState } from '@/page-layout/states/widgetInsertionContextComponentState';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { getReplaceWidgetSidePanelPage } from '@/side-panel/pages/page-layout/utils/getReplaceWidgetSidePanelPage';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useCallback } from 'react';

export const useOpenReplaceWidgetPicker = (pageLayoutId: string) => {
  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const setWidgetInsertionContext = useSetAtomComponentState(
    widgetInsertionContextComponentState,
    pageLayoutId,
  );

  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  const openReplaceWidgetPicker = useCallback(() => {
    setWidgetInsertionContext(null);
    navigatePageLayoutSidePanel({
      sidePanelPage: getReplaceWidgetSidePanelPage(pageLayoutDraft.type),
    });
  }, [
    navigatePageLayoutSidePanel,
    pageLayoutDraft.type,
    setWidgetInsertionContext,
  ]);

  return { openReplaceWidgetPicker };
};
