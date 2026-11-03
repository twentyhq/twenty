import { ConditionalDisplaySettings } from '@/conditional-display/components/ConditionalDisplaySettings';
import { useUpdatePageLayoutTab } from '@/page-layout/hooks/useUpdatePageLayoutTab';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelTabVisibilitySubPage = () => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();

  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutTabSettingsOpenTabId = useAtomComponentStateValue(
    pageLayoutTabSettingsOpenTabIdComponentState,
    pageLayoutId,
  );

  const { updatePageLayoutTab } = useUpdatePageLayoutTab(pageLayoutId);

  const tab = pageLayoutDraft.tabs.find(
    (draftTab) => draftTab.id === pageLayoutTabSettingsOpenTabId,
  );

  if (!isDefined(tab)) {
    return null;
  }

  return (
    <ConditionalDisplaySettings
      surface="pageLayoutTab"
      surfaceId={tab.id}
      conditionalDisplay={tab.conditionalDisplay}
      objectMetadataId={pageLayoutDraft.objectMetadataId}
      onConditionalDisplayChange={(conditionalDisplay) =>
        updatePageLayoutTab(tab.id, { conditionalDisplay })
      }
    />
  );
};
