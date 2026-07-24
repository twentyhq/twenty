import { type SlackAssistantRequestDraft } from 'src/logic-functions/types/slack-assistant-request-draft.type';

export type ParsedSlackAssistantRequest =
  | {
      request: SlackAssistantRequestDraft;
      requiresActiveThreadSubscription: boolean;
    }
  | { request: null; skipReason: string };
