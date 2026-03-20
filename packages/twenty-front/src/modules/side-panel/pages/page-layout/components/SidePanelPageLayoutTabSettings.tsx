import { SidePanelPageLayoutTabSettingsContent } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutTabSettingsContent';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelPageLayoutTabSettings = () => {
  const { pageLayoutId, recordId } = usePageLayoutIdFromContextStore();

  if (!isDefined(pageLayoutId)) {
    return null;
  }

  return (
    <SidePanelPageLayoutTabSettingsContent
      pageLayoutId={pageLayoutId}
      recordId={recordId}
    />
  );
};
