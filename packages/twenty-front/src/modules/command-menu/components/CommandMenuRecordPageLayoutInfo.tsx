import { CommandMenuPageLayoutInfoContent } from '@/command-menu/components/CommandMenuPageLayoutInfoContent';
import { useRecordPageLayoutIdFromRecordStoreOrThrow } from '@/page-layout/hooks/useRecordPageLayoutIdFromRecordStoreOrThrow';

export const CommandMenuRecordPageLayoutInfo = () => {
  const { pageLayoutId } = useRecordPageLayoutIdFromRecordStoreOrThrow();

  return <CommandMenuPageLayoutInfoContent pageLayoutId={pageLayoutId} />;
};
