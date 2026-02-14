import { CommandMenuPageLayoutInfoContent } from '@/command-menu/components/CommandMenuPageLayoutInfoContent';
import { usePageLayoutIdForRecordPageLayoutFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutIdForRecordPageLayoutFromContextStoreTargetedRecord';

export const CommandMenuRecordPageLayoutInfo = () => {
  const { pageLayoutId } =
    usePageLayoutIdForRecordPageLayoutFromContextStoreTargetedRecord();

  return <CommandMenuPageLayoutInfoContent pageLayoutId={pageLayoutId} />;
};
