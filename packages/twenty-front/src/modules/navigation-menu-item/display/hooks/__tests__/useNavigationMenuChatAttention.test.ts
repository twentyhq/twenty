import { renderHook } from '@testing-library/react';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { useInboxOpenThreadsSummary } from '@/inbox/hooks/useInboxOpenThreadsSummary';
import { useNavigationMenuChatAttention } from '@/navigation-menu-item/display/hooks/useNavigationMenuChatAttention';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

let mockIsAiChatInboxEnabled = true;

jest.mock('@/inbox/hooks/useInboxOpenThreadsSummary');
jest.mock('@/navigation-menu-item/display/hooks/useNavigationMenuItemsData');
jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => mockIsAiChatInboxEnabled,
}));

const buildSection = (
  id: string,
  parentId: string,
  builtInSectionKey: string | null,
): NavigationMenuItem => ({
  id,
  type: NavigationMenuItemType.SECTION,
  parentId,
  builtInSectionKey,
  position: 0,
  isActive: true,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
});

const mockSummary = (
  summary: Partial<ReturnType<typeof useInboxOpenThreadsSummary>>,
) =>
  jest.mocked(useInboxOpenThreadsSummary).mockReturnValue({
    openThreadCount: 0,
    unreadOpenThreadCount: 0,
    needsInputThreadCount: 0,
    mentionThreadCount: 0,
    assignedToMeThreadCount: 0,
    assignedThreadCount: 0,
    unassignedThreadCount: 0,
    hasUnreadOpenThread: false,
    hasUnreadMentionThread: false,
    hasUnreadAssignedThread: false,
    ...summary,
  });

describe('useNavigationMenuChatAttention', () => {
  beforeEach(() => {
    mockIsAiChatInboxEnabled = true;
    jest.mocked(useNavigationMenuItemsData).mockReturnValue({
      navigationMenuItems: [],
      workspaceNavigationMenuItems: [
        buildSection('channels-section', 'chats-tab', 'aiChatChannels'),
        buildSection('sales-section', 'sales-tab', null),
      ],
      currentWorkspaceMemberId: undefined,
      currentUserWorkspaceId: undefined,
    });
  });

  it('flags tabs holding a chat section while a chat needs input', () => {
    mockSummary({ needsInputThreadCount: 1 });

    const { result } = renderHook(() => useNavigationMenuChatAttention());

    expect(result.current.chatAttention).toBe('needs-input');
    expect(result.current.getTabChatAttention('chats-tab')).toBe('needs-input');
    expect(result.current.getTabChatAttention('sales-tab')).toBeNull();
  });

  it('flags an unread mention as unread', () => {
    mockSummary({ hasUnreadMentionThread: true, unreadOpenThreadCount: 1 });

    const { result } = renderHook(() => useNavigationMenuChatAttention());

    expect(result.current.getTabChatAttention('chats-tab')).toBe('unread');
  });

  it('ignores an unread chat that is neither a mention nor an assignment', () => {
    mockSummary({ hasUnreadOpenThread: true, unreadOpenThreadCount: 1 });

    const { result } = renderHook(() => useNavigationMenuChatAttention());

    expect(result.current.chatAttention).toBeNull();
  });

  it('flags nothing while the inbox is off', () => {
    mockIsAiChatInboxEnabled = false;
    mockSummary({ needsInputThreadCount: 1 });

    const { result } = renderHook(() => useNavigationMenuChatAttention());

    expect(result.current.chatAttention).toBeNull();
  });
});
