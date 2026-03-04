import { SidePanelPageLayoutInfoContent } from '@/command-menu/components/SidePanelPageLayoutInfoContent';
import { usePageLayoutIdForRecordPageLayoutFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutIdForRecordPageLayoutFromContextStoreTargetedRecord';

export const SidePanelRecordPageLayoutInfo = () => {
  const { pageLayoutId } =
    usePageLayoutIdForRecordPageLayoutFromContextStoreTargetedRecord();

  return <SidePanelPageLayoutInfoContent pageLayoutId={pageLayoutId} />;
};
