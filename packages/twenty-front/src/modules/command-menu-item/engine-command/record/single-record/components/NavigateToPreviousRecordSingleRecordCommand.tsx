import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useMountedEngineCommandContext } from '@/command-menu-item/engine-command/hooks/useMountedEngineCommandContext';
import { useRecordShowPagePagination } from '@/object-record/record-show/hooks/useRecordShowPagePagination';
import { isDefined } from 'twenty-shared/utils';

export const NavigateToPreviousRecordSingleRecordCommand = () => {
  const { objectMetadataItem, selectedRecords } =
    useMountedEngineCommandContext();

  const recordId = selectedRecords[0]?.id;

  if (!isDefined(recordId) || !isDefined(objectMetadataItem)) {
    throw new Error(
      'Record ID and object metadata are required to navigate to previous record',
    );
  }

  const { navigateToPreviousRecord } = useRecordShowPagePagination(
    objectMetadataItem.nameSingular,
    recordId,
  );

  return (
    <HeadlessEngineCommandWrapperEffect execute={navigateToPreviousRecord} />
  );
};
