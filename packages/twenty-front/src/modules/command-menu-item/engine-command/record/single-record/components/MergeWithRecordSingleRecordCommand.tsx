import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useOpenMergeWithRecordInSidePanel } from '@/side-panel/hooks/useOpenMergeWithRecordInSidePanel';

export const MergeWithRecordSingleRecordCommand = () => {
  const { objectMetadataItem, selectedRecords } =
    useHeadlessCommandContextApi();
  const { openMergeWithRecordInSidePanel } =
    useOpenMergeWithRecordInSidePanel();

  if (!isDefined(objectMetadataItem) || selectedRecords.length !== 1) {
    throw new Error(
      doNotTranslate('Merging with another record needs exactly one record'),
    );
  }

  const handleExecute = () =>
    openMergeWithRecordInSidePanel({
      objectNameSingular: objectMetadataItem.nameSingular,
      recordId: selectedRecords[0].id,
    });

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
