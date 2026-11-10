import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { AiChatTypingParticipants } from '@/ai/components/AiChatTypingParticipants';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import { agentChatTypingWorkspaceMemberIdsFamilyState } from '@/ai/states/agentChatTypingWorkspaceMemberIdsFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const THREAD_ID = '20202020-0000-4000-8000-000000000001';
const CURRENT_MEMBER_ID = '20202020-0000-4000-8000-000000000002';
const OTHER_MEMBER_ID = '20202020-0000-4000-8000-000000000003';

const buildWorkspaceMember = (id: string, firstName: string) => ({
  id,
  userId: `user-${id}`,
  name: { firstName, lastName: '' },
  colorScheme: 'Light' as const,
  locale: 'en',
  userEmail: `${firstName.toLowerCase()}@example.com`,
  avatarUrl: null,
});

const renderTypingParticipants = (typingWorkspaceMemberIds: string[]) => {
  jotaiStore.set(
    agentChatTypingWorkspaceMemberIdsFamilyState.atomFamily({
      threadId: THREAD_ID,
    }),
    typingWorkspaceMemberIds,
  );

  return render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <AiChatTypingParticipants />
      </I18nProvider>
    </JotaiProvider>,
  );
};

describe('AiChatTypingParticipants', () => {
  beforeEach(() => {
    resetJotaiStore();

    jotaiStore.set(currentAiChatThreadState.atom, THREAD_ID);
    jotaiStore.set(agentChatDisplayedThreadState.atom, THREAD_ID);
    jotaiStore.set(
      agentChatMessagesFamilyState.atomFamily({ threadId: THREAD_ID }),
      [
        {
          id: 'message-id',
          role: 'user',
          parts: [{ type: 'text', text: 'Hello' }],
        },
      ],
    );
    jotaiStore.set(
      currentWorkspaceMemberState.atom,
      buildWorkspaceMember(CURRENT_MEMBER_ID, 'Thomas'),
    );
    jotaiStore.set(currentWorkspaceMembersState.atom, [
      buildWorkspaceMember(CURRENT_MEMBER_ID, 'Thomas'),
      buildWorkspaceMember(OTHER_MEMBER_ID, 'Sarah'),
    ]);
  });

  it('shows the other members typing in the conversation', () => {
    renderTypingParticipants([CURRENT_MEMBER_ID, OTHER_MEMBER_ID]);

    expect(screen.getByRole('status')).toHaveTextContent('Sarah is typing…');
  });

  it('shows nothing when only the current member is typing', () => {
    const { container } = renderTypingParticipants([CURRENT_MEMBER_ID]);

    expect(container).toBeEmptyDOMElement();
  });
});
