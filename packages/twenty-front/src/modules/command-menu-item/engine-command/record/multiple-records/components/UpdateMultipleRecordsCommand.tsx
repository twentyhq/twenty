import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useMountedCommandState } from '@/command-menu-item/engine-command/hooks/useMountedCommandState';
import { useOpenUpdateMultipleRecordsPageInSidePanel } from '@/side-panel/hooks/useOpenUpdateMultipleRecordsPageInSidePanel';

export const UpdateMultipleRecordsCommand = () => {
  const { contextStoreInstanceId } = useMountedCommandState();

  const { openUpdateMultipleRecordsPageInSidePanel } =
    useOpenUpdateMultipleRecordsPageInSidePanel({
      contextStoreInstanceId,
    });

  const handleExecute = () => {
    openUpdateMultipleRecordsPageInSidePanel();
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
