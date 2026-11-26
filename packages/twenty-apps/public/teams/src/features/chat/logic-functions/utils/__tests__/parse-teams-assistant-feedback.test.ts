import { describe, expect, it } from 'vitest';

import { parseTeamsAssistantFeedback } from 'src/features/chat/logic-functions/utils/parse-teams-assistant-feedback';

const parse = (actionValue: { reaction?: string; feedback?: string }) =>
  parseTeamsAssistantFeedback({
    value: { actionName: 'feedback', actionValue },
  });

describe('parseTeamsAssistantFeedback', () => {
  it('should read a thumbs up with its comment', () => {
    expect(
      parse({ reaction: 'like', feedback: '{"feedbackText":" Nice! "}' }),
    ).toEqual({ feedbackRating: 'POSITIVE', feedbackText: 'Nice!' });
  });

  it('should read a thumbs down', () => {
    expect(
      parse({ reaction: 'dislike', feedback: '{"feedbackText":"Wrong"}' }),
    ).toEqual({ feedbackRating: 'NEGATIVE', feedbackText: 'Wrong' });
  });

  it.each([
    ['is missing', undefined],
    ['is empty', '{"feedbackText":""}'],
    ['is not JSON', 'Nice!'],
    ['holds no text', '{"feedbackText":42}'],
    ['is null', 'null'],
  ])('should keep the rating when the comment %s', (_, feedback) => {
    expect(parse({ reaction: 'like', feedback })).toEqual({
      feedbackRating: 'POSITIVE',
      feedbackText: '',
    });
  });

  it.each([['love'], [undefined]])(
    'should ignore the unknown reaction %s',
    (reaction) => {
      expect(parse({ reaction })).toBeUndefined();
    },
  );
});
