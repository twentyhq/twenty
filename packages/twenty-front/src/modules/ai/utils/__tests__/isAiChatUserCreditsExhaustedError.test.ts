import { CombinedGraphQLErrors } from '@apollo/client/errors';

import { AiChatErrorCode } from '@/ai/utils/aiChatErrorCode';
import { createAiChatCodedError } from '@/ai/utils/createAiChatCodedError';
import { isAiChatUserCreditsExhaustedError } from '@/ai/utils/isAiChatUserCreditsExhaustedError';

const buildError = (extensions: Record<string, unknown>) =>
  new CombinedGraphQLErrors({
    data: null,
    errors: [{ message: 'refused', extensions }],
  });

describe('isAiChatUserCreditsExhaustedError', () => {
  it('covers a reopened turn that user credits stopped and a send refused upfront', () => {
    expect(
      isAiChatUserCreditsExhaustedError(
        createAiChatCodedError(
          'stopped',
          AiChatErrorCode.USER_CREDITS_EXHAUSTED,
        ),
      ),
    ).toBe(true);

    expect(
      isAiChatUserCreditsExhaustedError(
        buildError({ code: 'QUOTA_EXHAUSTED', exhaustedKind: 'userAllowance' }),
      ),
    ).toBe(true);
  });

  it('leaves workspace credits and configured limits out', () => {
    expect(
      isAiChatUserCreditsExhaustedError(
        buildError({
          code: 'QUOTA_EXHAUSTED',
          exhaustedKind: 'workspaceAllowance',
        }),
      ),
    ).toBe(false);
    expect(
      isAiChatUserCreditsExhaustedError(
        buildError({ code: 'QUOTA_EXHAUSTED', exhaustedKind: 'limit' }),
      ),
    ).toBe(false);
    expect(isAiChatUserCreditsExhaustedError(new Error('boom'))).toBe(false);
  });
});
