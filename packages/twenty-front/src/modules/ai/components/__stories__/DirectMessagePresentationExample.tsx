import { styled } from '@linaria/react';
import { createStore, Provider } from 'jotai';
import { useState } from 'react';
import { IconHash, IconMessage } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { DirectMessageMemberPicker } from '@/ai/components/DirectMessageMemberPicker';
import { NavigationDrawerDirectMessagesSection } from '@/ai/components/NavigationDrawerDirectMessagesSection';
import { DIRECT_MESSAGE_PRESENTATION_FIXTURE } from '@/ai/components/__stories__/directMessagePresentationFixture';
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

type DirectMessagePresentationExampleProps = {
  onSelectThread: (threadId: string) => void;
  onSelectMember: (workspaceMemberId: string) => void;
  memberState?: 'loading' | 'refreshing' | 'results';
};

export const DirectMessagePresentationExample = ({
  onSelectThread,
  onSelectMember,
  memberState = 'results',
}: DirectMessagePresentationExampleProps) => {
  const [store] = useState(() => {
    const initialStore = createStore();
    initialStore.set(isNavigationDrawerExpandedState.atom, true);
    return initialStore;
  });
  const [currentThreadId, setCurrentThreadId] = useState('dm-anna');
  const [isChannelsOpen, setIsChannelsOpen] = useState(true);
  const [isDirectMessagesOpen, setIsDirectMessagesOpen] = useState(true);
  const [isRecentOpen, setIsRecentOpen] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const { currentMember, directMessages } = DIRECT_MESSAGE_PRESENTATION_FIXTURE;
  const matchingHumanMembers = filterBySearchQuery({
    items: [currentMember, ...directMessages.map(({ peer }) => peer)],
    searchQuery: searchValue,
    getSearchableValues: ({ name, email }) => [name, email],
  });

  return (
    <Provider store={store}>
      <StyledSidebar>
        <CollapsibleNavigationDrawerSection
          sectionId="stories/direct-messages/channels"
          label="Channels"
          isOpen={isChannelsOpen}
          onOpenChange={setIsChannelsOpen}
        >
          <NavigationDrawerItem label="General" Icon={IconHash} />
          <NavigationDrawerItem label="Product" Icon={IconHash} />
        </CollapsibleNavigationDrawerSection>
        <NavigationDrawerDirectMessagesSection
          directMessages={directMessages}
          currentThreadId={currentThreadId}
          isOpen={isDirectMessagesOpen}
          onOpenChange={setIsDirectMessagesOpen}
          onSelect={(threadId) => {
            setCurrentThreadId(threadId);
            onSelectThread(threadId);
          }}
          memberPicker={
            <DirectMessageMemberPicker
              humanMembers={
                memberState === 'loading' ? [] : matchingHumanMembers
              }
              currentWorkspaceMemberId={currentMember.workspaceMemberId}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              isLoading={memberState !== 'results'}
              onSelect={(workspaceMemberId) => {
                setIsDirectMessagesOpen(true);
                onSelectMember(workspaceMemberId);
              }}
            />
          }
        />
        <CollapsibleNavigationDrawerSection
          sectionId="stories/direct-messages/recent"
          label="Recent"
          isOpen={isRecentOpen}
          onOpenChange={setIsRecentOpen}
        >
          <NavigationDrawerItem label="Research notes" Icon={IconMessage} />
          <NavigationDrawerItem label="Quarterly planning" Icon={IconMessage} />
        </CollapsibleNavigationDrawerSection>
      </StyledSidebar>
    </Provider>
  );
};
