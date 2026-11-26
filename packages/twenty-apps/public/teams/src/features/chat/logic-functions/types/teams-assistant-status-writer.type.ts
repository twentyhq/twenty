import { type TeamsAssistantAnswerMarkers } from 'src/features/chat/logic-functions/types/teams-assistant-answer-markers.type';

export type TeamsAssistantStatusWriter = {
  update: (text: string) => Promise<void>;
  finish: (
    text: string,
    answerMarkers?: TeamsAssistantAnswerMarkers,
  ) => Promise<string>;
};
