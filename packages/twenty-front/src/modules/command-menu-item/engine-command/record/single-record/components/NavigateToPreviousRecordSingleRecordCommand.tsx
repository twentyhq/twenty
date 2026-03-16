import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useEngineCommandExecutionContext } from '@/command-menu-item/engine-command/hooks/useEngineCommandExecutionContext';
import { useRecordShowPagePagination } from '@/object-record/record-show/hooks/useRecordShowPagePagination';
import { isDefined } from 'twenty-shared/utils';

export const NavigateToPreviousRecordSingleRecordCommand = () => {
  const { objectMetadataItem, recordId } = useEngineCommandExecutionContext();

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
