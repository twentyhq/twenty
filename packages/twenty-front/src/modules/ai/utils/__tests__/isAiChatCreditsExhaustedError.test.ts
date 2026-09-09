import { CombinedGraphQLErrors } from '@apollo/client/errors';

import { isAiChatCreditsExhaustedError } from '@/ai/utils/isAiChatCreditsExhaustedError';

const buildError = (extensions: Record<string, unknown>) =>
  new CombinedGraphQLErrors({
    data: null,
    errors: [{ message: 'refused', extensions }],
  });

describe('isAiChatCreditsExhaustedError', () => {
  it('covers both ways the server reports spent credits', () => {
    expect(
      isAiChatCreditsExhaustedError(
        buildError({ code: 'BILLING_CREDITS_EXHAUSTED' }),
      ),
    ).toBe(true);

    expect(
      isAiChatCreditsExhaustedError(
        buildError({ code: 'QUOTA_EXHAUSTED', exhaustedKind: 'allowance' }),
      ),
    ).toBe(true);
  });

  it('leaves a configured limit out of the credits banner', () => {
    expect(
      isAiChatCreditsExhaustedError(
        buildError({ code: 'QUOTA_EXHAUSTED', exhaustedKind: 'limit' }),
      ),
    ).toBe(false);
    expect(isAiChatCreditsExhaustedError(new Error('boom'))).toBe(false);
  });
});
