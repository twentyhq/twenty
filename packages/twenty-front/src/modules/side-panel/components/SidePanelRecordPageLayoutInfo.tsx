import { SidePanelPageLayoutInfoContent } from '@/side-panel/components/SidePanelPageLayoutInfoContent';
import { usePageLayoutIdForRecordPageLayoutFromContextStoreTargetedRecord } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdForRecordPageLayoutFromContextStoreTargetedRecord';

export const SidePanelRecordPageLayoutInfo = () => {
  const { pageLayoutId } =
    usePageLayoutIdForRecordPageLayoutFromContextStoreTargetedRecord();

  return <SidePanelPageLayoutInfoContent pageLayoutId={pageLayoutId} />;
};
