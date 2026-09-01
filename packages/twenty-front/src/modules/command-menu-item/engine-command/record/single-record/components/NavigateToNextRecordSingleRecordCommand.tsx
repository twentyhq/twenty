import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useRecordShowPagePaginationCommandContext } from '@/command-menu-item/engine-command/record/single-record/hooks/useRecordShowPagePaginationCommandContext';
import { useRecordShowPagePagination } from '@/object-record/record-show/hooks/useRecordShowPagePagination';

export const NavigateToNextRecordSingleRecordCommand = () => {
  const { objectNameSingular, recordId } =
    useRecordShowPagePaginationCommandContext();

  const { navigateToNextRecord, isLoadingPagination } =
    useRecordShowPagePagination(objectNameSingular, recordId);

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={navigateToNextRecord}
      ready={!isLoadingPagination}
    />
  );
};
