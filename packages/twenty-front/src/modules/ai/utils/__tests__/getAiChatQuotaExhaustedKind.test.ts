import { CombinedGraphQLErrors } from '@apollo/client/errors';

import { getAiChatQuotaExhaustedKind } from '@/ai/utils/getAiChatQuotaExhaustedKind';

const buildError = (extensions: Record<string, unknown>) =>
  new CombinedGraphQLErrors({
    data: null,
    errors: [{ message: 'refused', extensions }],
  });

describe('getAiChatQuotaExhaustedKind', () => {
  it('tells a spent allowance apart from a configured limit', () => {
    expect(
      getAiChatQuotaExhaustedKind(
        buildError({ code: 'QUOTA_EXHAUSTED', exhaustedKind: 'allowance' }),
      ),
    ).toBe('allowance');

    expect(
      getAiChatQuotaExhaustedKind(
        buildError({ code: 'QUOTA_EXHAUSTED', exhaustedKind: 'limit' }),
      ),
    ).toBe('limit');
  });

  it('reports an unreadable refusal as a limit, never as spent credits', () => {
    expect(
      getAiChatQuotaExhaustedKind(buildError({ code: 'QUOTA_EXHAUSTED' })),
    ).toBe('limit');
  });

  it('ignores errors that are not quota refusals', () => {
    expect(
      getAiChatQuotaExhaustedKind(buildError({ code: 'RATE_LIMITED' })),
    ).toBeNull();
    expect(getAiChatQuotaExhaustedKind(new Error('boom'))).toBeNull();
  });
});
