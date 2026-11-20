import { isNonEmptyString } from '@sniptt/guards';

import { type TeamsAssistantRequestRecord } from 'src/features/chat/logic-functions/types/teams-assistant-request-record.type';
import { getTeamsAssistantRequestLeaseCutoff } from 'src/features/chat/logic-functions/utils/get-teams-assistant-request-lease-cutoff';

export const isTeamsAssistantRequestStale = (
  record: Pick<TeamsAssistantRequestRecord, 'updatedAt'>,
): boolean =>
  isNonEmptyString(record.updatedAt) &&
  new Date(record.updatedAt) < getTeamsAssistantRequestLeaseCutoff();
