import { type SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useOpenAiChatThreadPageInSidePanel } from '@/side-panel/hooks/useOpenAiChatThreadPageInSidePanel';

type OpenAiChatThreadPageCommandProps = {
  page: SidePanelPages.MoveAiChatToChannel | SidePanelPages.LinkAiChatToRecords;
};

export const OpenAiChatThreadPageCommand = ({
  page,
}: OpenAiChatThreadPageCommandProps) => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const { openAiChatThreadPageInSidePanel } =
    useOpenAiChatThreadPageInSidePanel();

  const handleExecute = () => {
    const [thread] = selectedRecords;

    if (isDefined(thread)) {
      openAiChatThreadPageInSidePanel({ threadId: thread.id, page });
    }
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
