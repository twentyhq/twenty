import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { AiChatThreadAssigneeDropdown } from '@/ai/components/AiChatThreadAssigneeDropdown';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const THREAD_ID = 'thread-1';
const assignChatThread = jest.fn();

let participants: { userWorkspaceId: string }[] = [];

jest.mock('@/ai/hooks/useChatThreadParticipants', () => ({
  useChatThreadParticipants: () => ({ participants }),
}));
jest.mock('@/ai/hooks/useChatThreadInboxActions', () => ({
  useChatThreadInboxActions: () => ({ assignChatThread }),
}));

const TIM = {
  id: 'member-tim',
  userWorkspaceId: 'uw-tim',
  name: { firstName: 'Tim', lastName: 'Apple' },
  avatarUrl: null,
};
const ADA = {
  id: 'member-ada',
  userWorkspaceId: 'uw-ada',
  name: { firstName: 'Ada', lastName: 'Lovelace' },
  avatarUrl: null,
};

const setThread = (assigneeUserWorkspaceId: string | null) => {
  const threads = [
    {
      __typename: 'AgentChatThread',
      id: THREAD_ID,
      channelId: null,
      assigneeUserWorkspaceId,
    },
  ];

  jotaiStore.set(metadataStoreState.atomFamily('agentChatThreads'), {
    current: threads,
    draft: threads,
    status: 'up-to-date',
  } as never);
  jotaiStore.set(metadataStoreState.atomFamily('agentChatChannelMembers'), {
    current: [],
    draft: [],
    status: 'up-to-date',
  } as never);
};

const renderDropdown = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <AiChatThreadAssigneeDropdown threadId={THREAD_ID} />
      </I18nProvider>
    </JotaiProvider>,
  );

describe('AiChatThreadAssigneeDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    participants = [
      { userWorkspaceId: 'uw-tim' },
      { userWorkspaceId: 'uw-ada' },
    ];
    jotaiStore.set(currentWorkspaceMembersState.atom, [TIM, ADA] as never);
    jotaiStore.set(currentWorkspaceMemberState.atom, TIM as never);
  });

  it('hands the thread to a teammate who can read it', async () => {
    const user = userEvent.setup();

    setThread(null);
    renderDropdown();

    await user.click(screen.getByRole('button', { name: 'Assign chat' }));
    await user.click(screen.getByText('Ada Lovelace'));

    expect(assignChatThread).toHaveBeenCalledWith(THREAD_ID, 'uw-ada');
  });

  it('names the current assignee and offers to take it back off them', async () => {
    const user = userEvent.setup();

    setThread('uw-ada');
    renderDropdown();

    expect(
      screen.getByRole('button', { name: 'Assigned to Ada Lovelace' }),
    ).toBeVisible();

    await user.click(
      screen.getByRole('button', { name: 'Assigned to Ada Lovelace' }),
    );
    await user.click(screen.getByText('Unassign'));

    expect(assignChatThread).toHaveBeenCalledWith(THREAD_ID, null);
  });

  it('offers Assign to me only while the thread is somebody else’s', async () => {
    const user = userEvent.setup();

    setThread('uw-tim');
    renderDropdown();

    await user.click(
      screen.getByRole('button', { name: 'Assigned to Tim Apple' }),
    );

    expect(screen.queryByText('Assign to me')).toBeNull();
  });
});
