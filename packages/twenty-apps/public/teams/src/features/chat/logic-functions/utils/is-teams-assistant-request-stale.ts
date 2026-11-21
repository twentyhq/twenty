import { isNonEmptyString } from '@sniptt/guards';

import { getTeamsAssistantRequestLeaseCutoff } from 'src/features/chat/logic-functions/utils/get-teams-assistant-request-lease-cutoff';

export const isTeamsAssistantRequestStale = ({
  updatedAt,
  nowMs = Date.now(),
}: {
  updatedAt: string | undefined;
  nowMs?: number;
}): boolean =>
  isNonEmptyString(updatedAt) &&
  new Date(updatedAt) < getTeamsAssistantRequestLeaseCutoff(nowMs);
