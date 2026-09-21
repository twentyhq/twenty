import { useCurrentAiChatThreadAccess } from '@/ai/hooks/useCurrentAiChatThreadAccess';

export const useIsCurrentAiChatThreadReadOnly = () =>
  useCurrentAiChatThreadAccess() !== 'owner';
