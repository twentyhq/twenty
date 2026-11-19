import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useSelectAllInboxThreads } from '@/inbox/hooks/useSelectAllInboxThreads';

export const SelectAllAiChatsNoSelectionRecordCommand = () => {
  const { selectAllInboxThreads } = useSelectAllInboxThreads();

  return <HeadlessEngineCommandWrapperEffect execute={selectAllInboxThreads} />;
};
