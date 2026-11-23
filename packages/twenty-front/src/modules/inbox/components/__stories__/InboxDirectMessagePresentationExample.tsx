import { styled } from '@linaria/react';
import { createStore, Provider } from 'jotai';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconHash, IconMessage } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { InboxDirectMessageMemberPicker } from '@/inbox/components/InboxDirectMessageMemberPicker';
import { onlineWorkspaceMemberIdsState } from '@/tab-presence/states/onlineWorkspaceMemberIdsState';
import { NavigationDrawerInboxDirectMessagesSection } from '@/inbox/components/NavigationDrawerInboxDirectMessagesSection';
import { INBOX_DIRECT_MESSAGE_PRESENTATION_FIXTURE } from '@/inbox/components/__stories__/inboxDirectMessagePresentationFixture';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NAVIGATION_DRAWER_CONSTRAINTS } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerConstraints';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

const StyledSidebar = styled.div`
  background: ${themeCssVariables.background.secondary};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]};
  padding-right: 0;
  width: ${NAVIGATION_DRAWER_CONSTRAINTS.default}px;
`;

type InboxDirectMessagePresentationExampleProps = {
  onSelectThread: (threadId: string) => void;
  onSelectMember: (workspaceMemberId: string) => void;
  memberState?: 'loading' | 'refreshing' | 'results';
  onlineWorkspaceMemberIds?: string[];
};

export const InboxDirectMessagePresentationExample = ({
  onSelectThread,
  onSelectMember,
  memberState = 'results',
  onlineWorkspaceMemberIds,
}: InboxDirectMessagePresentationExampleProps) => {
  const [store] = useState(() => {
    const initialStore = createStore();
    initialStore.set(isNavigationDrawerExpandedState.atom, true);
    initialStore.set(
      onlineWorkspaceMemberIdsState.atom,
      onlineWorkspaceMemberIds ?? null,
    );
    return initialStore;
  });
  const [currentThreadId, setCurrentThreadId] = useState('dm-anna');
  const [searchValue, setSearchValue] = useState('');
  const { currentMember, directMessages } =
    INBOX_DIRECT_MESSAGE_PRESENTATION_FIXTURE;
  const matchingHumanMembers = filterBySearchQuery({
    items: [
      currentMember,
      ...directMessages.flatMap(({ peer }) => (isDefined(peer) ? [peer] : [])),
    ],
    searchQuery: searchValue,
    getSearchableValues: ({ name, email }) => [name, email],
  });

  return (
    <Provider store={store}>
      <StyledSidebar>
        <CollapsibleNavigationDrawerSection
          sectionId="stories/direct-messages/channels"
          label="Channels"
        >
          <NavigationDrawerItem label="General" Icon={IconHash} />
          <NavigationDrawerItem label="Product" Icon={IconHash} />
        </CollapsibleNavigationDrawerSection>
        <NavigationDrawerInboxDirectMessagesSection
          directMessages={directMessages}
          currentThreadId={currentThreadId}
          onSelect={(threadId) => {
            setCurrentThreadId(threadId);
            onSelectThread(threadId);
          }}
          memberPicker={
            <InboxDirectMessageMemberPicker
              humanMembers={
                memberState === 'loading' ? [] : matchingHumanMembers
              }
              currentWorkspaceMemberId={currentMember.workspaceMemberId}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              isLoading={memberState !== 'results'}
              onSelect={onSelectMember}
            />
          }
        />
        <CollapsibleNavigationDrawerSection
          sectionId="stories/direct-messages/recent"
          label="Recent"
        >
          <NavigationDrawerItem label="Research notes" Icon={IconMessage} />
          <NavigationDrawerItem label="Quarterly planning" Icon={IconMessage} />
        </CollapsibleNavigationDrawerSection>
      </StyledSidebar>
    </Provider>
  );
};
