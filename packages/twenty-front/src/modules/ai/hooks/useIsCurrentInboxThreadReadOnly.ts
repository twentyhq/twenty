import { useCurrentInboxThreadAccess } from '@/ai/hooks/useCurrentInboxThreadAccess';

export const useIsCurrentInboxThreadReadOnly = () =>
  useCurrentInboxThreadAccess() !== 'writer';
