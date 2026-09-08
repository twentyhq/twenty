import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { enUS } from 'date-fns/locale';

import { getAiChatQuotaHint } from '@/ai/utils/getAiChatQuotaHint';

const buildError = (extensions: Record<string, unknown>) =>
  new CombinedGraphQLErrors({
    data: null,
    errors: [{ message: 'refused', extensions }],
  });

const getHint = (extensions: Record<string, unknown>) =>
  getAiChatQuotaHint({ error: buildError(extensions), localeCatalog: enUS });

describe('getAiChatQuotaHint', () => {
  it('says when the limit resets and who can raise it', () => {
    expect(
      getHint({
        code: 'QUOTA_EXHAUSTED',
        exhaustedKind: 'limit',
        retryAfterMs: 50_400_000,
      }),
    ).toBe(
      'Resets in about 14 hours. Ask a workspace admin to raise the limit.',
    );
  });

  it('drops the reset when the refusal carries no delay', () => {
    expect(getHint({ code: 'QUOTA_EXHAUSTED', exhaustedKind: 'limit' })).toBe(
      'Ask a workspace admin to raise the limit.',
    );
  });

  it('stays silent when credits are spent, since the banner acts instead', () => {
    expect(
      getHint({
        code: 'QUOTA_EXHAUSTED',
        exhaustedKind: 'allowance',
        retryAfterMs: 50_400_000,
      }),
    ).toBeUndefined();
  });

  it('stays silent for errors that are not quota refusals', () => {
    expect(
      getHint({ code: 'RATE_LIMITED', retryAfterMs: 1000 }),
    ).toBeUndefined();
  });
});
