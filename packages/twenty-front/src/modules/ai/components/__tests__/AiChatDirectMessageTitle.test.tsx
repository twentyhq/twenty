import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { AiChatDirectMessageTitle } from '@/ai/components/AiChatDirectMessageTitle';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { messages } from '~/locales/generated/en';
import { mockedWorkspaceMemberData } from '~/testing/mock-data/users';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const CURRENT_MEMBER = mockedWorkspaceMemberData;

const PEER_MEMBER = {
  ...mockedWorkspaceMemberData,
  id: '4b1e7c2a-9d3f-4e6a-8b5c-1f2e3d4c5b6a',
  name: { firstName: 'Marie', lastName: 'Stoppa' },
  userEmail: 'marie@test.com',
};

const DIRECT_MESSAGE_ID = '8c3d5e7f-1a2b-4c6d-9e8f-0a1b2c3d4e5f';

const buildDirectMessage = (
  directMessage: Partial<AgentChatThreadRecord>,
): AgentChatThreadRecord => ({
  __typename: 'AgentChatThread',
  id: DIRECT_MESSAGE_ID,
  title: null,
  conversationType: AgentChatThreadConversationType.DIRECT_MESSAGE,
  deletedAt: null,
  createdAt: '2026-11-06T00:00:00.000Z',
  updatedAt: '2026-11-06T00:00:00.000Z',
  ...directMessage,
});

const renderTitle = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <AiChatDirectMessageTitle threadId={DIRECT_MESSAGE_ID} />
      </I18nProvider>
    </JotaiProvider>,
  );

describe('AiChatDirectMessageTitle', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(currentWorkspaceMemberState.atom, CURRENT_MEMBER);
    jotaiStore.set(currentWorkspaceMembersState.atom, [
      CURRENT_MEMBER,
      PEER_MEMBER,
    ]);
  });

  it.each([
    ['first', CURRENT_MEMBER.id, PEER_MEMBER.id],
    ['second', PEER_MEMBER.id, CURRENT_MEMBER.id],
  ])(
    'names the other member when the current one is %s in the pair',
    (_position, firstWorkspaceMemberId, secondWorkspaceMemberId) => {
      jotaiStore.set(
        recordStoreFamilyState.atomFamily(DIRECT_MESSAGE_ID),
        buildDirectMessage({
          directMessageFirstWorkspaceMemberId: firstWorkspaceMemberId,
          directMessageSecondWorkspaceMemberId: secondWorkspaceMemberId,
        }),
      );

      renderTitle();

      expect(screen.getByText('Marie Stoppa')).toBeInTheDocument();
      expect(screen.queryByText('Untitled')).not.toBeInTheDocument();
    },
  );

  it('names a member who left the workspace as a former member', () => {
    jotaiStore.set(currentWorkspaceMembersState.atom, [CURRENT_MEMBER]);
    jotaiStore.set(
      recordStoreFamilyState.atomFamily(DIRECT_MESSAGE_ID),
      buildDirectMessage({
        directMessageFirstWorkspaceMemberId: CURRENT_MEMBER.id,
        directMessageSecondWorkspaceMemberId: PEER_MEMBER.id,
      }),
    );

    renderTitle();

    expect(screen.getByText('Former member')).toBeInTheDocument();
  });
});
