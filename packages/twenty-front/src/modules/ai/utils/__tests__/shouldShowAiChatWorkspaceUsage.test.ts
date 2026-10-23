import { shouldShowAiChatWorkspaceUsage } from '@/ai/utils/shouldShowAiChatWorkspaceUsage';
import { UserCreditsFallback } from '~/generated-metadata/graphql';

const periodEnd = '2026-10-26T00:00:00.000Z';

describe('shouldShowAiChatWorkspaceUsage', () => {
  it('shows workspace usage when the member has no user credits', () => {
    expect(
      shouldShowAiChatWorkspaceUsage({
        userCreditsUsage: null,
        userCreditsFallback: UserCreditsFallback.STOP,
      }),
    ).toBe(true);
  });

  it('shows workspace usage while user credits are left', () => {
    expect(
      shouldShowAiChatWorkspaceUsage({
        userCreditsUsage: {
          limitValue: 4160000,
          consumedValue: 1000000,
          periodEnd,
        },
        userCreditsFallback: UserCreditsFallback.STOP,
      }),
    ).toBe(true);
  });

  it('shows workspace usage once user credits run out only when chats fall back to it', () => {
    const userCreditsUsage = {
      limitValue: 4160000,
      consumedValue: 4160000,
      periodEnd,
    };

    expect(
      shouldShowAiChatWorkspaceUsage({
        userCreditsUsage,
        userCreditsFallback: UserCreditsFallback.WORKSPACE_CREDITS,
      }),
    ).toBe(true);
    expect(
      shouldShowAiChatWorkspaceUsage({
        userCreditsUsage,
        userCreditsFallback: UserCreditsFallback.STOP,
      }),
    ).toBe(false);
  });
});
