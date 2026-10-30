import { styled } from '@linaria/react';
import { createStore, Provider } from 'jotai';
import { useState } from 'react';
import { IconHash, IconMessage } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { normalizeSearchText } from 'twenty-ui/utilities';

import { DirectMessageMemberPicker } from '@/ai/components/DirectMessageMemberPicker';
import { NavigationDrawerDirectMessagesSection } from '@/ai/components/NavigationDrawerDirectMessagesSection';
import { DIRECT_MESSAGE_PRESENTATION_FIXTURE } from '@/ai/components/__stories__/directMessagePresentationFixture';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';

const StyledSidebar = styled.div`
  background: ${themeCssVariables.background.secondary};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]};
  padding-right: 0;
  width: 220px;
`;

const StyledControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[3]};
`;

type DirectMessagePresentationExampleProps = {
  onSelectThread: (threadId: string) => void;
  onSelectMember: (workspaceMemberId: string) => void;
  showDataControls?: boolean;
};

export const DirectMessagePresentationExample = ({
  onSelectThread,
  onSelectMember,
  showDataControls = false,
}: DirectMessagePresentationExampleProps) => {
  const [store] = useState(() => {
    const initialStore = createStore();
    initialStore.set(isNavigationDrawerExpandedState.atom, true);
    return initialStore;
  });
  const [activeThreadId, setActiveThreadId] = useState('dm-anna');
  const [isChannelsOpen, setIsChannelsOpen] = useState(true);
  const [isSectionOpen, setIsSectionOpen] = useState(true);
  const [isRecentOpen, setIsRecentOpen] = useState(true);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [memberState, setMemberState] = useState<
    'loading' | 'empty' | 'results'
  >(showDataControls ? 'loading' : 'results');
  const { currentMember, directMessages } = DIRECT_MESSAGE_PRESENTATION_FIXTURE;
  const normalizedSearch = normalizeSearchText(searchValue);
  const humanMembers =
    memberState === 'empty'
      ? []
      : [currentMember, ...directMessages.map(({ peer }) => peer)].filter(
          (member) =>
            normalizeSearchText(`${member.name} ${member.email}`).includes(
              normalizedSearch,
            ),
        );

  const handlePickerOpenChange = (isOpen: boolean) => {
    setIsPickerOpen(isOpen);

    if (isOpen) {
      setSearchValue('');
    }
  };

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
          activeThreadId={activeThreadId}
          isOpen={isSectionOpen}
          onOpenChange={setIsSectionOpen}
          onSelect={(threadId) => {
            setActiveThreadId(threadId);
            onSelectThread(threadId);
          }}
          memberPicker={
            <DirectMessageMemberPicker
              humanMembers={humanMembers}
              currentWorkspaceMemberId={currentMember.workspaceMemberId}
              isOpen={isPickerOpen}
              onOpenChange={handlePickerOpenChange}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              isLoading={memberState === 'loading'}
              onSelect={onSelectMember}
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
      {showDataControls && (
        <StyledControls>
          <Button size="sm" onClick={() => setMemberState('loading')}>
            Load members
          </Button>
          <Button size="sm" onClick={() => setMemberState('empty')}>
            Show empty result
          </Button>
          <Button size="sm" onClick={() => setMemberState('results')}>
            Show members
          </Button>
        </StyledControls>
      )}
    </Provider>
  );
};
