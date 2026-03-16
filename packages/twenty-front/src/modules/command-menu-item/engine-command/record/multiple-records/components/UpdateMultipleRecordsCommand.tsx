import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useEngineCommandExecutionContext } from '@/command-menu-item/engine-command/hooks/useEngineCommandExecutionContext';
import { useOpenUpdateMultipleRecordsPageInSidePanel } from '@/side-panel/hooks/useOpenUpdateMultipleRecordsPageInSidePanel';

export const UpdateMultipleRecordsCommand = () => {
  const { contextStoreInstanceId } = useEngineCommandExecutionContext();

  const { openUpdateMultipleRecordsPageInSidePanel } =
    useOpenUpdateMultipleRecordsPageInSidePanel({
      contextStoreInstanceId,
    });

  const handleExecute = () => {
    openUpdateMultipleRecordsPageInSidePanel();
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
