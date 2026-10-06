import { type TeamsAssistantRequestDraft } from 'src/features/chat/logic-functions/types/teams-assistant-request-draft.type';

export type TeamsAssistantRequestRecord =
  Partial<TeamsAssistantRequestDraft> & {
    id: string;
    status?: string;
    updatedAt?: string;
  };
