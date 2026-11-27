import { type TeamsAssistantAnswerMarkers } from 'src/features/chat/logic-functions/types/teams-assistant-answer-markers.type';

// Same wire format as addFeedback() in the Teams SDK.
export const buildTeamsAssistantAnswerMarkers =
  (): TeamsAssistantAnswerMarkers => ({
    channelData: { feedbackLoop: { type: 'default' } },
  });
