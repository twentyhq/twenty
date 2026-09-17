import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { type ReactNode } from 'react';

import { AiChatThreadParticipantsDropdownContent } from '@/ai/components/AiChatThreadParticipantsDropdownContent';
import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { agentChatThreadParticipantsComponentFamilyState } from '@/ai/states/agentChatThreadParticipantsComponentFamilyState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import {
  type AgentChatThreadParticipant,
  AgentChatThreadParticipantRole,
} from '~/generated-metadata/graphql';

const addChatThreadParticipant = jest.fn();
const removeChatThreadParticipant = jest.fn();

jest.mock('@/ai/hooks/useAddChatThreadParticipant', () => ({
  useAddChatThreadParticipant: () => ({ addChatThreadParticipant }),
}));
jest.mock('@/ai/hooks/useRemoveChatThreadParticipant', () => ({
  useRemoveChatThreadParticipant: () => ({ removeChatThreadParticipant }),
}));

const THREAD_ID = 'thread-1';
const INSTANCE_ID = 'ai-chat-participants-test';

const buildMember = (
  id: string,
  userWorkspaceId: string,
  firstName: string,
  lastName: string,
) => ({
  __typename: 'WorkspaceMember' as const,
  id,
  userWorkspaceId,
  userId: `user-${id}`,
  userEmail: `${firstName.toLowerCase()}@twenty.com`,
  name: { firstName, lastName },
  avatarUrl: null,
  colorScheme: 'Light' as const,
  locale: 'en',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
});

const TIM = buildMember('member-tim', 'uw-tim', 'Tim', 'Apple');
const JONY = buildMember('member-jony', 'uw-jony', 'Jony', 'Ive');
const PHIL = buildMember('member-phil', 'uw-phil', 'Phil', 'Schiler');

const buildParticipant = (
  userWorkspaceId: string,
  role: AgentChatThreadParticipantRole,
): AgentChatThreadParticipant => ({
  __typename: 'AgentChatThreadParticipant',
  id: `participant-${userWorkspaceId}`,
  threadId: THREAD_ID,
  userWorkspaceId,
  role,
  createdAt: '2026-09-01T00:00:00.000Z',
});

const renderWithStore = (currentMember: typeof TIM) => {
  const store = createStore();

  store.set(currentWorkspaceMembersState.atom, [TIM, JONY, PHIL]);
  store.set(currentWorkspaceMemberState.atom, currentMember);
  store.set(
    agentChatThreadParticipantsComponentFamilyState.atomFamily({
      instanceId: INSTANCE_ID,
      familyKey: { threadId: THREAD_ID },
    }),
    [
      buildParticipant(
        TIM.userWorkspaceId,
        AgentChatThreadParticipantRole.OWNER,
      ),
      buildParticipant(
        JONY.userWorkspaceId,
        AgentChatThreadParticipantRole.MEMBER,
      ),
    ],
  );

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <I18nProvider i18n={i18n}>
        <AgentChatComponentInstanceContext.Provider
          value={{ instanceId: INSTANCE_ID }}
        >
          {children}
        </AgentChatComponentInstanceContext.Provider>
      </I18nProvider>
    </JotaiProvider>
  );

  return render(
    <AiChatThreadParticipantsDropdownContent threadId={THREAD_ID} />,
    { wrapper: Wrapper },
  );
};

describe('AiChatThreadParticipantsDropdownContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lets the owner add remaining workspace members and remove members', async () => {
    const user = userEvent.setup();
    renderWithStore(TIM);

    expect(screen.getByText('Tim Apple')).toBeVisible();
    expect(screen.getByText(/Owner/)).toBeVisible();
    expect(screen.getByText('Jony Ive')).toBeVisible();
    expect(screen.getByText('Add people')).toBeVisible();

    await user.click(screen.getByText('Phil Schiler'));
    expect(addChatThreadParticipant).toHaveBeenCalledWith(PHIL.userWorkspaceId);

    await user.click(screen.getByRole('button', { name: 'Remove Jony Ive' }));
    expect(removeChatThreadParticipant).toHaveBeenCalledWith(
      JONY.userWorkspaceId,
    );
  });

  it('only lets a member leave the thread', async () => {
    const user = userEvent.setup();
    renderWithStore(JONY);

    expect(screen.queryByText('Add people')).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Remove Jony Ive' }),
    ).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Leave thread' }));
    expect(removeChatThreadParticipant).toHaveBeenCalledWith(
      JONY.userWorkspaceId,
    );
  });
});
