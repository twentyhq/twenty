import { useCurrentInboxThreadAccess } from '@/ai/hooks/useCurrentAiChatThreadAccess';

export const useIsCurrentInboxThreadReadOnly = () =>
  useCurrentInboxThreadAccess() !== 'writer';
