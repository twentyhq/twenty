import { type TeamsAssistantAnswerMarkers } from 'src/features/chat/logic-functions/types/teams-assistant-answer-markers.type';

export type TeamsAssistantStatusMessage = {
  text: string;
  answerMarkers?: TeamsAssistantAnswerMarkers;
};
