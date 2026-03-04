import { SidePanelPageLayoutInfoContent } from '@/side-panel/components/SidePanelPageLayoutInfoContent';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/side-panel/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelDashboardPageLayoutInfo = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();

  if (!isDefined(pageLayoutId)) {
    return null;
  }

  return <SidePanelPageLayoutInfoContent pageLayoutId={pageLayoutId} />;
};
