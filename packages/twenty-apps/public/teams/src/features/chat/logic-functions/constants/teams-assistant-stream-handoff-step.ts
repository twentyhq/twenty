import { type TeamsAssistantStatusStep } from 'src/features/chat/logic-functions/types/teams-assistant-status-step.type';

// Teams rejects stream updates two minutes after the stream opens, so the bubble is closed before that.
export const TEAMS_ASSISTANT_STREAM_HANDOFF_STEP: TeamsAssistantStatusStep = {
  afterSeconds: 105,
  text: 'Still on it, thanks for waiting… The answer will follow in a moment.',
};
