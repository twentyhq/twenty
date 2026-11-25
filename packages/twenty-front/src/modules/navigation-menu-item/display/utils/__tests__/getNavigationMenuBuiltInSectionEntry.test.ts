import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { getNavigationMenuBuiltInSectionEntry } from '@/navigation-menu-item/display/utils/getNavigationMenuBuiltInSectionEntry';

const buildThread = ({
  id,
  lastActivityAt,
}: {
  id: string;
  lastActivityAt: string;
}) =>
  ({
    id,
    lastActivityAt,
    updatedAt: lastActivityAt,
  }) as AiChatThreadRecord;

const EMPTY_DATA = {
  favoriteChannels: [],
  favoriteThreads: [],
  accessibleChannels: [],
  recentThreads: [],
  agents: [],
};

describe('getNavigationMenuBuiltInSectionEntry', () => {
  it('opens a favorite channel before a favorite chat', () => {
    expect(
      getNavigationMenuBuiltInSectionEntry({
        ...EMPTY_DATA,
        builtInSectionKey: 'aiChatFavorites',
        favoriteChannels: [{ id: 'channel-id' }],
        favoriteThreads: [buildThread({ id: 'thread-id', lastActivityAt: '' })],
      }),
    ).toEqual({ type: 'inboxChannel', channelId: 'channel-id' });
  });

  it('opens the latest recent chat that is not a favorite', () => {
    const favoriteThread = buildThread({
      id: 'favorite-thread-id',
      lastActivityAt: '2026-11-25T12:00:00.000Z',
    });

    expect(
      getNavigationMenuBuiltInSectionEntry({
        ...EMPTY_DATA,
        builtInSectionKey: 'aiChatRecents',
        favoriteThreads: [favoriteThread],
        recentThreads: [
          buildThread({
            id: 'older-thread-id',
            lastActivityAt: '2026-11-25T10:00:00.000Z',
          }),
          favoriteThread,
          buildThread({
            id: 'latest-thread-id',
            lastActivityAt: '2026-11-25T11:00:00.000Z',
          }),
        ],
      }),
    ).toEqual({ type: 'aiChatThread', threadId: 'latest-thread-id' });
  });

  it('opens the agents page when no agent is loaded', () => {
    expect(
      getNavigationMenuBuiltInSectionEntry({
        ...EMPTY_DATA,
        builtInSectionKey: 'aiAgents',
      }),
    ).toEqual({ type: 'link', link: getAppPath(AppPath.AgentIndexPage) });
  });

  it('returns null for an empty channels section', () => {
    expect(
      getNavigationMenuBuiltInSectionEntry({
        ...EMPTY_DATA,
        builtInSectionKey: 'aiChatChannels',
      }),
    ).toBeNull();
  });
});
