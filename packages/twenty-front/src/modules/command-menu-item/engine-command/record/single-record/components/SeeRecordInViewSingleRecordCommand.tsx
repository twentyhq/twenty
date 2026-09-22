import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useOpenRecordViewsPageInSidePanel } from '@/side-panel/hooks/useOpenRecordViewsPageInSidePanel';
import { isDefined } from 'twenty-shared/utils';

export const SeeRecordInViewSingleRecordCommand = () => {
  const { objectMetadataItem, selectedRecords } =
    useHeadlessCommandContextApi();
  const { openRecordViewsPageInSidePanel } =
    useOpenRecordViewsPageInSidePanel();

  const handleExecute = () => {
    const record = selectedRecords[0];

    if (!isDefined(record) || !isDefined(objectMetadataItem)) {
      return;
    }

    openRecordViewsPageInSidePanel({
      objectNameSingular: objectMetadataItem.nameSingular,
      recordId: record.id,
    });
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
