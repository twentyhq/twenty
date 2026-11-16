import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { InboxThreadInboxCommand } from '@/command-menu-item/engine-command/record/components/InboxThreadInboxCommand';
import { CommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/CommandComponentInstanceContext';
import { setInboxSelectedChannelView } from '@/inbox/testing/setInboxSelectedChannelView';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadFilter,
  AgentChatChannelThreadStatus,
  AgentChatInboxAction,
} from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const CHANNEL_ID = '3d8a1f5c-6b2e-4c9d-8e7f-0a1b2c3d4e5f';

const mockMarkAgentChatThreadAsDoneInChannel = jest.fn();
const mockUpdateAgentChatThreadInboxState = jest.fn();
const mockOpenSnoozeAiChatInSidePanel = jest.fn();

// Like the real command flow, the selected record comes straight from the
// record store, without the member's inbox status
jest.mock(
  '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi',
  () => ({
    useHeadlessCommandContextApi: () => ({
      selectedRecords: [{ id: THREAD_ID }],
    }),
  }),
);

jest.mock('@/ai/hooks/useMarkAiChatThreadAsDoneInChannel', () => ({
  useMarkAiChatThreadAsDoneInChannel: () => ({
    markAgentChatThreadAsDoneInChannel: mockMarkAgentChatThreadAsDoneInChannel,
  }),
}));

jest.mock('@/ai/hooks/useUpdateAiChatThreadStatus', () => ({
  useUpdateAiChatThreadStatus: () => ({
    updateAgentChatThreadInboxState: mockUpdateAgentChatThreadInboxState,
  }),
}));

jest.mock('@/side-panel/hooks/useOpenSnoozeAiChatInSidePanel', () => ({
  useOpenSnoozeAiChatInSidePanel: () => ({
    openSnoozeAiChatInSidePanel: mockOpenSnoozeAiChatInSidePanel,
  }),
}));

jest.mock('@/side-panel/hooks/useOpenAssignAiChatInSidePanel', () => ({
  useOpenAssignAiChatInSidePanel: () => ({
    openAssignAiChatInSidePanel: jest.fn(),
  }),
}));

const renderCommand = ({
  action,
  isChannelOnScreen,
}: {
  action: AgentChatInboxAction;
  isChannelOnScreen: boolean;
}) => {
  const thread: ObjectRecord = {
    __typename: 'AgentChatThread',
    id: THREAD_ID,
    channelId: CHANNEL_ID,
    channelArchivedAt: null,
    channelSnoozedUntil: null,
    lastActivityAt: '2026-11-10T09:00:00.000Z',
  };
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    onInitializeJotaiStore: (store) => {
      store.set(recordStoreFamilyState.atomFamily(THREAD_ID), thread);
      setInboxSelectedChannelView(
        store,
        isChannelOnScreen
          ? {
              channelId: CHANNEL_ID,
              channelStatus: AgentChatChannelThreadStatus.OPEN,
              assignment: AgentChatChannelAssignmentFilter.ANY,
              filter: AgentChatChannelThreadFilter.ANY,
            }
          : null,
      );
    },
  });

  render(
    <Wrapper>
      <MemoryRouter initialEntries={[`/inbox/${THREAD_ID}`]}>
        <CommandComponentInstanceContext.Provider
          value={{ instanceId: 'inbox-thread-command' }}
        >
          <InboxThreadInboxCommand action={action} />
        </CommandComponentInstanceContext.Provider>
      </MemoryRouter>
    </Wrapper>,
  );
};

beforeEach(() => {
  jest.clearAllMocks();
});

it('marks a chat done for its channel when the channel is on screen', async () => {
  renderCommand({
    action: AgentChatInboxAction.ARCHIVE,
    isChannelOnScreen: true,
  });

  await waitFor(() =>
    expect(
      mockMarkAgentChatThreadAsDoneInChannel.mock.calls.map(
        ([threadId]) => threadId,
      ),
    ).toEqual([THREAD_ID]),
  );
  expect(mockUpdateAgentChatThreadInboxState).not.toHaveBeenCalled();
});

it('marks a chat done for the member from their own inbox', async () => {
  renderCommand({
    action: AgentChatInboxAction.ARCHIVE,
    isChannelOnScreen: false,
  });

  await waitFor(() =>
    expect(mockUpdateAgentChatThreadInboxState).toHaveBeenCalledWith({
      threadIds: [THREAD_ID],
      action: AgentChatInboxAction.ARCHIVE,
    }),
  );
  expect(mockMarkAgentChatThreadAsDoneInChannel).not.toHaveBeenCalled();
});

it('snoozes a chat for its channel when the channel is on screen', async () => {
  renderCommand({
    action: AgentChatInboxAction.SNOOZE,
    isChannelOnScreen: true,
  });

  await waitFor(() =>
    expect(mockOpenSnoozeAiChatInSidePanel).toHaveBeenCalledWith({
      threadIds: [THREAD_ID],
      isInChannel: true,
    }),
  );
});
