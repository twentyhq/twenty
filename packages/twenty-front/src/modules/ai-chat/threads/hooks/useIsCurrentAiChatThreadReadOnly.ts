import { useCurrentAiChatThreadAccess } from '@/ai-chat/threads/hooks/useCurrentAiChatThreadAccess';

export const useIsCurrentAiChatThreadReadOnly = () =>
  useCurrentAiChatThreadAccess() !== 'writer';
