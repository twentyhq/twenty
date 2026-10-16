import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useRecordShowPagePagination } from '@/object-record/record-show/hooks/useRecordShowPagePagination';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

export const NavigateToNextRecordSingleRecordCommand = () => {
  const { objectMetadataItem, selectedRecords } =
    useHeadlessCommandContextApi();

  const recordId = selectedRecords[0]?.id;

  if (!isDefined(recordId) || !isDefined(objectMetadataItem)) {
    throw new Error(
      doNotTranslate(
        'Record ID and object metadata are required to navigate to next record',
      ),
    );
  }

  const { navigateToNextRecord, isLoadingPagination } =
    useRecordShowPagePagination(objectMetadataItem.nameSingular, recordId);

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={navigateToNextRecord}
      ready={!isLoadingPagination}
    />
  );
};
