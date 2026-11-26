import { type TeamsAssistantAnswerMarkers } from 'src/features/chat/logic-functions/types/teams-assistant-answer-markers.type';

export type TeamsAssistantStatusWriter = {
  update: (text: string) => Promise<void>;
  finish: (message: {
    text: string;
    answerMarkers?: TeamsAssistantAnswerMarkers;
  }) => Promise<string>;
};
