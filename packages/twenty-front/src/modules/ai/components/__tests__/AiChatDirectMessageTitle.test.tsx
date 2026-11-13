import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { AiChatDirectMessageTitle } from '@/ai/components/AiChatDirectMessageTitle';
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

const DIRECT_MESSAGE_ID = '8c3d5e7f-1a2b-4c6d-9e8f-0a1b2c3d4e5f';

const PEER_MEMBER = {
  ...mockedWorkspaceMemberData,
  id: '4b1e7c2a-9d3f-4e6a-8b5c-1f2e3d4c5b6a',
  name: { firstName: 'Marie', lastName: 'Stoppa' },
};

describe('AiChatDirectMessageTitle', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('names the other member of the direct message', () => {
    jotaiStore.set(currentWorkspaceMemberState.atom, mockedWorkspaceMemberData);
    jotaiStore.set(currentWorkspaceMembersState.atom, [
      mockedWorkspaceMemberData,
      PEER_MEMBER,
    ]);
    jotaiStore.set(recordStoreFamilyState.atomFamily(DIRECT_MESSAGE_ID), {
      __typename: 'AgentChatThread',
      id: DIRECT_MESSAGE_ID,
      title: null,
      conversationType: AgentChatThreadConversationType.DIRECT_MESSAGE,
      directMessageFirstWorkspaceMemberId: PEER_MEMBER.id,
      directMessageSecondWorkspaceMemberId: mockedWorkspaceMemberData.id,
    });

    render(
      <JotaiProvider store={jotaiStore}>
        <I18nProvider i18n={i18n}>
          <AiChatDirectMessageTitle threadId={DIRECT_MESSAGE_ID} />
        </I18nProvider>
      </JotaiProvider>,
    );

    expect(screen.getByText('Marie Stoppa')).toBeInTheDocument();
  });
});
