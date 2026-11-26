import { type TeamsAssistantAnswerMarkers } from 'src/features/chat/logic-functions/types/teams-assistant-answer-markers.type';

// Same wire format as addAiGenerated() and addFeedback() in the Teams SDK.
export const buildTeamsAssistantAnswerMarkers =
  (): TeamsAssistantAnswerMarkers => ({
    entities: [
      {
        type: 'https://schema.org/Message',
        '@type': 'Message',
        '@context': 'https://schema.org',
        '@id': '',
        additionalType: ['AIGeneratedContent'],
      },
    ],
    channelData: { feedbackLoop: { type: 'default' } },
  });
