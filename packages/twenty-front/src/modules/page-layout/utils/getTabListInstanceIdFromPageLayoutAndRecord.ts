import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { type LayoutRenderingContextType } from '@/ui/layout/contexts/LayoutRenderingContext';
import { getTabListInstanceIdFromPageLayoutId } from './getTabListInstanceIdFromPageLayoutId';
import { isDefined } from 'twenty-shared/utils';

export const getTabListInstanceIdFromPageLayoutAndRecord = ({
  pageLayoutId,
  layoutType,
  targetRecordIdentifier,
}: {
  pageLayoutId: string;
  layoutType: LayoutRenderingContextType['layoutType'];
  targetRecordIdentifier?: TargetRecordIdentifier;
}) => {
  // Include record ID in tab instance ID to prevent tab synchronization between different records
  // Only for RECORD_PAGE layouts, as DASHBOARD layouts are standalone
  const recordId =
    layoutType === 'RECORD_PAGE' ? targetRecordIdentifier?.id : undefined;
  const baseInstanceId = getTabListInstanceIdFromPageLayoutId(pageLayoutId);
  return isDefined(recordId) ? `${baseInstanceId}-${recordId}` : baseInstanceId;
};
