import { CommandMenuPageLayoutInfoContent } from '@/command-menu/components/CommandMenuPageLayoutInfoContent';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { isDefined } from 'twenty-shared/utils';

export const CommandMenuDashboardPageLayoutInfo = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();

  if (!isDefined(pageLayoutId)) {
    return null;
  }

  return <CommandMenuPageLayoutInfoContent pageLayoutId={pageLayoutId} />;
};
