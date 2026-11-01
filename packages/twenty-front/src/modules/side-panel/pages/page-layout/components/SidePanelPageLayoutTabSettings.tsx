import { SidePanelPageLayoutTabSettingsContent } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutTabSettingsContent';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';

export const SidePanelPageLayoutTabSettings = () => {
  const { pageLayoutId, targetRecordIdentifier } =
    usePageLayoutSidePanelTarget();

  return (
    <SidePanelPageLayoutTabSettingsContent
      pageLayoutId={pageLayoutId}
      recordId={targetRecordIdentifier.id}
    />
  );
};
