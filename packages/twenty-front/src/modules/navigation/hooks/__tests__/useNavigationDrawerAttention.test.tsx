import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useNavigationDrawerAttention } from '@/navigation/hooks/useNavigationDrawerAttention';
import {
  GetAgentChatOpenThreadsSummaryDocument,
  type GetAgentChatOpenThreadsSummaryQuery,
  type NavigationMenuItem,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { mockedUserData } from '~/testing/mock-data/users';

let mockIsCustomizableSidebarEnabled = true;

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: (featureFlagKey: string) =>
    featureFlagKey === 'IS_CUSTOMIZABLE_SIDEBAR_ENABLED'
      ? mockIsCustomizableSidebarEnabled
      : true,
}));

type OpenThreadsSummary =
  GetAgentChatOpenThreadsSummaryQuery['agentChatOpenThreadsSummary'];

const UNREAD_MENTION_SUMMARY: OpenThreadsSummary = {
  __typename: 'AgentChatOpenThreadsSummary',
  openThreadCount: 1,
  needsInputThreadCount: 0,
  hasUnreadOpenThread: true,
  hasUnreadMentionThread: true,
  hasUnreadAssignedThread: false,
  unreadMentionThreadCount: 1,
  unreadAssignedThreadCount: 0,
};

const buildChatSection = (
  type: NavigationMenuItemType,
): NavigationMenuItem => ({
  id: `${type}-section`,
  type,
  folderId: 'inbox-tab',
  position: 0,
  createdAt: '',
  updatedAt: '',
});

const renderNavigationDrawerAttention = ({
  navigationMenuItems,
  summary = UNREAD_MENTION_SUMMARY,
}: {
  navigationMenuItems: NavigationMenuItem[];
  summary?: OpenThreadsSummary;
}) => {
  const store = createStore();

  store.set(currentUserWorkspaceState.atom, {
    ...mockedUserData.currentUserWorkspace,
    permissionFlags: [PermissionFlagType.AI],
  });
  store.set(metadataStoreState.atomFamily('navigationMenuItems'), {
    current: navigationMenuItems,
    draft: [],
    status: 'up-to-date',
  });

  return renderHook(() => useNavigationDrawerAttention(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>
        <MockedProvider
          mocks={[
            {
              request: { query: GetAgentChatOpenThreadsSummaryDocument },
              delay: 0,
              result: { data: { agentChatOpenThreadsSummary: summary } },
            },
          ]}
        >
          {children}
        </MockedProvider>
      </Provider>
    ),
  });
};

const waitForOpenThreadsSummary = () =>
  act(() => new Promise((resolve) => setTimeout(resolve, 0)));

describe('useNavigationDrawerAttention', () => {
  beforeEach(() => {
    mockIsCustomizableSidebarEnabled = true;
  });

  it.each([
    {
      sidebar: 'an Inbox section',
      isCustomizableSidebarEnabled: true,
      navigationMenuItems: [
        buildChatSection(NavigationMenuItemType.AI_CHAT_TRIAGE),
      ],
      expected: 'unread',
    },
    {
      sidebar: 'chat sections without an Inbox',
      isCustomizableSidebarEnabled: true,
      navigationMenuItems: [
        buildChatSection(NavigationMenuItemType.AI_CHAT_RECENTS),
      ],
      expected: null,
    },
    {
      sidebar: 'the Inbox mode',
      isCustomizableSidebarEnabled: false,
      navigationMenuItems: [],
      expected: 'unread',
    },
  ])(
    'flags the sidebar for a mention when it shows $sidebar: $expected',
    async ({ isCustomizableSidebarEnabled, navigationMenuItems, expected }) => {
      mockIsCustomizableSidebarEnabled = isCustomizableSidebarEnabled;

      const { result } = renderNavigationDrawerAttention({
        navigationMenuItems,
      });
      await waitForOpenThreadsSummary();

      expect(result.current.inboxAttention).toBe('unread');
      expect(result.current.navigationDrawerAttention).toBe(expected);
    },
  );

  it('ranks chats waiting on the member above unread mentions', async () => {
    const { result } = renderNavigationDrawerAttention({
      navigationMenuItems: [
        buildChatSection(NavigationMenuItemType.AI_CHAT_TRIAGE),
      ],
      summary: { ...UNREAD_MENTION_SUMMARY, needsInputThreadCount: 2 },
    });
    await waitForOpenThreadsSummary();

    expect(result.current.navigationDrawerAttention).toBe('needs-input');
    expect(result.current.getTabAttention('inbox-tab')).toBe('needs-input');
    expect(result.current.getTabAttention(null)).toBeNull();
  });
});
