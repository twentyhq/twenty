import { SidePanelPageLayoutInfoContent } from '@/command-menu/components/SidePanelPageLayoutInfoContent';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelDashboardPageLayoutInfo = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();

  if (!isDefined(pageLayoutId)) {
    return null;
  }

  return <SidePanelPageLayoutInfoContent pageLayoutId={pageLayoutId} />;
};
