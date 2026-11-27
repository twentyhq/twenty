import { afterEach, describe, expect, it, vi } from 'vitest';

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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should keep the rating and warn when the comment is not JSON', () => {
    const warnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    expect(parse({ reaction: 'like', feedback: 'Nice!' })).toEqual({
      feedbackRating: 'POSITIVE',
      feedbackText: '',
    });
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['is missing', undefined],
    ['holds no text', '{"feedbackText":42}'],
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
