import { renderHook } from '@testing-library/react';

import { useCanWorkAiChatThread } from '@/ai/hooks/useCanWorkAiChatThread';

const THREAD_ID = 'thread-1';
const VIEWER_ID = 'uw-viewer';

let thread: Record<string, unknown> | undefined;
let participants: { userWorkspaceId: string }[] = [];
let channelWorkerIds: string[] = [];

jest.mock('@/ai/hooks/useAiChatThreadById', () => ({
  useAiChatThreadById: () => thread,
}));
jest.mock('@/ai/hooks/useChatThreadParticipants', () => ({
  useChatThreadParticipants: () => ({ participants }),
}));
jest.mock('@/ai/hooks/useChatChannels', () => ({
  useChatChannels: () => ({
    isCurrentUserChannelWorker: (channelId: string) =>
      channelWorkerIds.includes(channelId),
  }),
}));
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => ({ userWorkspaceId: VIEWER_ID }),
}));

const buildThread = (overrides: Record<string, unknown> = {}) => ({
  id: THREAD_ID,
  channelId: null,
  ownerUserWorkspaceId: 'uw-somebody-else',
  assigneeUserWorkspaceId: null,
  ...overrides,
});

const canWork = () =>
  renderHook(() => useCanWorkAiChatThread(THREAD_ID)).result.current;

describe('useCanWorkAiChatThread', () => {
  beforeEach(() => {
    thread = buildThread();
    participants = [];
    channelWorkerIds = [];
  });

  it('counts the owner', () => {
    thread = buildThread({ ownerUserWorkspaceId: VIEWER_ID });

    expect(canWork()).toBe(true);
  });

  it('counts whoever the thread was handed to', () => {
    thread = buildThread({ assigneeUserWorkspaceId: VIEWER_ID });

    expect(canWork()).toBe(true);
  });

  it('counts a participant', () => {
    participants = [{ userWorkspaceId: VIEWER_ID }];

    expect(canWork()).toBe(true);
  });

  it('counts somebody who joined the thread’s channel', () => {
    thread = buildThread({ channelId: 'channel-1' });
    channelWorkerIds = ['channel-1'];

    expect(canWork()).toBe(true);
  });

  it('leaves out a passer-by reading a public channel', () => {
    thread = buildThread({ channelId: 'channel-1' });

    expect(canWork()).toBe(false);
  });

  it('leaves out a reader of somebody else’s thread outside any channel', () => {
    expect(canWork()).toBe(false);
  });

  it('waits rather than hiding the actions while the thread is unknown', () => {
    thread = undefined;

    expect(canWork()).toBe(true);
  });
});
