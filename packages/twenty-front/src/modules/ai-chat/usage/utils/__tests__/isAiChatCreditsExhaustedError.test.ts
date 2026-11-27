import { CombinedGraphQLErrors } from '@apollo/client/errors';

import { AiChatErrorCode } from '@/ai-chat/utils/aiChatErrorCode';
import { createAiChatCodedError } from '@/ai-chat/utils/createAiChatCodedError';
import { isAiChatCreditsExhaustedError } from '@/ai-chat/usage/utils/isAiChatCreditsExhaustedError';

const buildError = (extensions: Record<string, unknown>) =>
  new CombinedGraphQLErrors({
    data: null,
    errors: [{ message: 'refused', extensions }],
  });

describe('isAiChatCreditsExhaustedError', () => {
  it('covers both ways spent credits reach the client', () => {
    expect(
      isAiChatCreditsExhaustedError(
        createAiChatCodedError('refused', AiChatErrorCode.CREDITS_EXHAUSTED),
      ),
    ).toBe(true);

    expect(
      isAiChatCreditsExhaustedError(
        buildError({
          code: 'QUOTA_EXHAUSTED',
          exhaustedKind: 'workspaceAllowance',
        }),
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
