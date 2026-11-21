import { useSyncAiChatThreadParticipants } from '@/ai-chat/threads/hooks/useSyncAiChatThreadParticipants';
import { useInvalidateAiChatToolIndexOnMetadataChange } from '@/ai-chat/tool-calls/hooks/useInvalidateAiChatToolIndexOnMetadataChange';

export const AiChatSyncEffect = () => {
  useSyncAiChatThreadParticipants();
  useInvalidateAiChatToolIndexOnMetadataChange();

  return null;
};
