import { type AgentChatThreadInboxStatus } from '@/ai/types/AgentChatThreadInboxStatus';

const TRIAGE_STATUS_BY_SCOPE = {
  INBOX: 'open',
  SNOOZED: 'snoozed',
  ARCHIVED: 'done',
} as const;

export const getAiChatThreadTriageStatus = ({
  hasAiPermission,
  isInboxEnabled,
  areParticipantsLoaded,
  scope,
}: {
  hasAiPermission: boolean;
  isInboxEnabled: boolean;
  areParticipantsLoaded: boolean;
  scope: AgentChatThreadInboxStatus['scope'];
}) => {
  if (
    !hasAiPermission ||
    !isInboxEnabled ||
    !areParticipantsLoaded ||
    scope === 'NONE'
  ) {
    return undefined;
  }

  return TRIAGE_STATUS_BY_SCOPE[scope];
};
