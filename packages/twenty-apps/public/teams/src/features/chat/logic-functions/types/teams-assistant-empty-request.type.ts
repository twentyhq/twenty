import { type TeamsAssistantRequestDraft } from 'src/features/chat/logic-functions/types/teams-assistant-request-draft.type';

export type TeamsAssistantEmptyRequest = Pick<
  TeamsAssistantRequestDraft,
  'teamsServiceUrl' | 'teamsConversationId' | 'teamsActivityId'
>;
