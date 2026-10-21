import { useParams } from 'react-router-dom';

import { AiChatNewThreadSelectionEffect } from '@/ai/components/AiChatNewThreadSelectionEffect';
import { AiChatPageCloseSidePanelChatEffect } from '@/ai/components/AiChatPageCloseSidePanelChatEffect';
import { AiChatPageContinueInSidePanelEffect } from '@/ai/components/AiChatPageContinueInSidePanelEffect';
import { AiChatPageThreadUrlSyncEffect } from '@/ai/components/AiChatPageThreadUrlSyncEffect';
import { AI_CHAT_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/AiChatNewThreadPathSegment';

// What a chat shown on the main page needs, full page or in the inbox
export const AiChatPageEffects = () => {
  const { threadId } = useParams();

  return (
    <>
      {threadId === AI_CHAT_NEW_THREAD_PATH_SEGMENT ? (
        <AiChatNewThreadSelectionEffect />
      ) : (
        <AiChatPageThreadUrlSyncEffect />
      )}
      <AiChatPageCloseSidePanelChatEffect />
      <AiChatPageContinueInSidePanelEffect />
    </>
  );
};
