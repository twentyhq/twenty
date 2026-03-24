import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useMountedCommandState } from '@/command-menu-item/engine-command/hooks/useMountedCommandState';
import { useRecordShowPagePagination } from '@/object-record/record-show/hooks/useRecordShowPagePagination';
import { isDefined } from 'twenty-shared/utils';

export const NavigateToNextRecordSingleRecordCommand = () => {
  const { objectMetadataItem, selectedRecords } = useMountedCommandState();

  const recordId = selectedRecords[0]?.id;

  if (!isDefined(recordId) || !isDefined(objectMetadataItem)) {
    throw new Error(
      'Record ID and object metadata are required to navigate to next record',
    );
  }

  const { navigateToNextRecord } = useRecordShowPagePagination(
    objectMetadataItem.nameSingular,
    recordId,
  );

  return <HeadlessEngineCommandWrapperEffect execute={navigateToNextRecord} />;
};
