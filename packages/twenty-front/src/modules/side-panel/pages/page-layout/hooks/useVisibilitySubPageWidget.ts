import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { sidePanelPageInfoSelector } from '@/side-panel/states/sidePanelPageInfoSelector';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SidePanelPages } from 'twenty-shared/types';

export const useVisibilitySubPageWidget = (pageLayoutId: string) => {
  const sidePanelPageInfo = useAtomStateValue(sidePanelPageInfoSelector);
  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );
  const pageLayoutTabSettingsOpenTabId = useAtomComponentStateValue(
    pageLayoutTabSettingsOpenTabIdComponentState,
    pageLayoutId,
  );
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  if (sidePanelPageInfo.page !== SidePanelPages.PageLayoutTabSettings) {
    return widgetInEditMode;
  }

  return pageLayoutDraft.tabs
    .find((tab) => tab.id === pageLayoutTabSettingsOpenTabId)
    ?.widgets.find((widget) => widget.isActive);
};
