import { getAiChatPageSidePanelContinuation } from '@/ai-chat/utils/getAiChatPageSidePanelContinuation';

const THREAD_ID = '20202020-0000-4000-8000-000000000014';
const NEW_THREAD_ID = '20202020-0000-4000-8000-000000000099';

const getContinuation = (
  overrides: Partial<Parameters<typeof getAiChatPageSidePanelContinuation>[0]>,
) =>
  getAiChatPageSidePanelContinuation({
    previousPathname: `/inbox/${THREAD_ID}`,
    location: { pathname: '/objects/companies', state: null },
    isMobile: false,
    newAiChatThreadId: NEW_THREAD_ID,
    isNewAiChatThreadReplySending: false,
    isNextHandoffSkipped: false,
    ...overrides,
  });

describe('getAiChatPageSidePanelContinuation', () => {
  it('continues a chat page left for another page in the side panel', () => {
    expect(getContinuation({})).toEqual({
      type: 'continueInSidePanel',
      threadId: THREAD_ID,
    });
  });

  it.each([
    { case: 'the next handoff is skipped', isNextHandoffSkipped: true },
    {
      case: 'the navigation skips the handoff',
      location: {
        pathname: '/objects/companies',
        state: { isAiChatHandoffSkipped: true },
      },
    },
    {
      case: 'the previous page was not a chat',
      previousPathname: '/objects/people',
    },
    { case: 'on mobile', isMobile: true },
    {
      case: 'the next page is a chat page',
      location: { pathname: '/inbox', state: null },
    },
  ])('does nothing when $case', ({ case: _case, ...overrides }) => {
    expect(getContinuation(overrides)).toEqual({ type: 'none' });
  });

  it('ends the workspace setup chat when settings open', () => {
    expect(
      getContinuation({
        location: { pathname: '/settings/profile', state: null },
      }),
    ).toEqual({ type: 'endWorkspaceSetupChat' });
  });

  it('opens a fresh chat when the idle new chat page is left', () => {
    expect(getContinuation({ previousPathname: '/chat' })).toEqual({
      type: 'continueInSidePanel',
      threadId: undefined,
    });
  });
});
