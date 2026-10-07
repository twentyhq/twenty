import { CombinedGraphQLErrors } from '@apollo/client/errors';

import { AiChatErrorCode } from '@/ai/utils/aiChatErrorCode';
import { createAiChatCodedError } from '@/ai/utils/createAiChatCodedError';
import { isAiChatCreditsExhaustedError } from '@/ai/utils/isAiChatCreditsExhaustedError';
import { isAiChatIncludedChatPausedError } from '@/ai/utils/isAiChatIncludedChatPausedError';

const buildError = (extensions: Record<string, unknown>) =>
  new CombinedGraphQLErrors({
    data: null,
    errors: [{ message: 'refused', extensions }],
  });

describe('isAiChatIncludedChatPausedError', () => {
  it('recognizes a refused send', () => {
    const error = buildError({
      code: 'QUOTA_EXHAUSTED',
      subCode: 'INCLUDED_CHAT_PAUSED',
    });

    expect(isAiChatIncludedChatPausedError(error)).toBe(true);
    expect(isAiChatCreditsExhaustedError(error)).toBe(false);
  });

  it('recognizes a turn the worker paused', () => {
    expect(
      isAiChatIncludedChatPausedError(
        createAiChatCodedError(
          'Workspace reached its included AI chat fair-use limit',
          AiChatErrorCode.INCLUDED_CHAT_PAUSED,
        ),
      ),
    ).toBe(true);
  });

  it('does not mistake a spent allowance or a usage limit for the pause', () => {
    expect(
      isAiChatIncludedChatPausedError(
        buildError({ code: 'QUOTA_EXHAUSTED', exhaustedKind: 'allowance' }),
      ),
    ).toBe(false);
    expect(
      isAiChatIncludedChatPausedError(
        buildError({ code: 'QUOTA_EXHAUSTED', exhaustedKind: 'limit' }),
      ),
    ).toBe(false);
    expect(
      isAiChatIncludedChatPausedError(
        createAiChatCodedError(
          'Chat stopped: no more available credits.',
          AiChatErrorCode.CREDITS_EXHAUSTED,
        ),
      ),
    ).toBe(false);
  });
});
