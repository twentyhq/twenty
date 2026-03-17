import { SidePanelPageLayoutTabSettingsContent } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutTabSettingsContent';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/side-panel/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelPageLayoutTabSettings = () => {
  const { pageLayoutId, recordId } =
    usePageLayoutIdFromContextStoreTargetedRecord();

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
