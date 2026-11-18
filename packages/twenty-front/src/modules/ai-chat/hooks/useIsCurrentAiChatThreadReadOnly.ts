import { useCurrentAiChatThreadAccess } from '@/ai-chat/hooks/useCurrentAiChatThreadAccess';

export const useIsCurrentAiChatThreadReadOnly = () =>
  useCurrentAiChatThreadAccess() !== 'writer';
