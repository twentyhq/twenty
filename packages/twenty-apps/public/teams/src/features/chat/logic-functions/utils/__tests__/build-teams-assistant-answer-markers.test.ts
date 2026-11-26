import { describe, expect, it } from 'vitest';

import { buildTeamsAssistantAnswerMarkers } from 'src/features/chat/logic-functions/utils/build-teams-assistant-answer-markers';

describe('buildTeamsAssistantAnswerMarkers', () => {
  it('should carry the AI generated label and turn on the default feedback buttons', () => {
    expect(buildTeamsAssistantAnswerMarkers()).toEqual({
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
  });
});
