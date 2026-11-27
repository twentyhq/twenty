import { describe, expect, it } from 'vitest';

import { buildTeamsAssistantAnswerMarkers } from 'src/features/chat/logic-functions/utils/build-teams-assistant-answer-markers';

describe('buildTeamsAssistantAnswerMarkers', () => {
  it('should turn on the default feedback buttons', () => {
    expect(buildTeamsAssistantAnswerMarkers()).toEqual({
      channelData: { feedbackLoop: { type: 'default' } },
    });
  });
});
