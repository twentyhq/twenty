import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useRecordShowPagePagination } from '@/object-record/record-show/hooks/useRecordShowPagePagination';
import { isDefined } from 'twenty-shared/utils';

export const NavigateToPreviousRecordSingleRecordCommand = () => {
  const { objectMetadataItem, selectedRecords } =
    useHeadlessCommandContextApi();

  const recordId = selectedRecords[0]?.id;

  if (!isDefined(recordId) || !isDefined(objectMetadataItem)) {
    throw new Error(
      // oxlint-disable-next-line lingui/no-unlocalized-strings -- This is an internal command precondition diagnostic.
      'Record ID and object metadata are required to navigate to previous record',
    );
  }

  const { navigateToPreviousRecord, isLoadingPagination } =
    useRecordShowPagePagination(objectMetadataItem.nameSingular, recordId);

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={navigateToPreviousRecord}
      ready={!isLoadingPagination}
    />
  );
};
