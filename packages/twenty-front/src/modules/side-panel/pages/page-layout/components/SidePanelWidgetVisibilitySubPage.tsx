import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { WidgetVisibilitySettings } from '@/side-panel/pages/page-layout/components/WidgetVisibilitySettings';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { sidePanelPageInfoSelector } from '@/side-panel/states/sidePanelPageInfoSelector';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelWidgetVisibilitySubPage = () => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
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

  const singleWidgetOfOpenTab = pageLayoutDraft.tabs
    .find((tab) => tab.id === pageLayoutTabSettingsOpenTabId)
    ?.widgets.find((tabWidget) => tabWidget.isActive);

  const widget =
    sidePanelPageInfo.page === SidePanelPages.PageLayoutTabSettings
      ? singleWidgetOfOpenTab
      : widgetInEditMode;

  if (!isDefined(widget)) {
    return null;
  }

  return (
    <WidgetVisibilitySettings pageLayoutId={pageLayoutId} widget={widget} />
  );
};
