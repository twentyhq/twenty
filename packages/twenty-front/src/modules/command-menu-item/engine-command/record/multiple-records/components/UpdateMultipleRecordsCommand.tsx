import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useOpenUpdateMultipleRecordsPageInSidePanel } from '@/side-panel/hooks/useOpenUpdateMultipleRecordsPageInSidePanel';

export const UpdateMultipleRecordsCommand = () => {
  const { contextStoreInstanceId } = useHeadlessCommandContextApi();

  const { openUpdateMultipleRecordsPageInSidePanel } =
    useOpenUpdateMultipleRecordsPageInSidePanel({
      contextStoreInstanceId,
    });

  const handleExecute = () => {
    openUpdateMultipleRecordsPageInSidePanel();
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
