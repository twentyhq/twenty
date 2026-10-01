import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'jotai';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { type ReactNode } from 'react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { AiChatPageHeader } from '@/ai/components/AiChatPageHeader';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

jest.mock('@/ui/layout/page/components/PageCardHeader', () => ({
  PageCardHeader: ({ title }: { title: ReactNode }) => <div>{title}</div>,
}));

describe('AiChatPageHeader', () => {
  beforeEach(() => resetJotaiStore());

  it('keeps the saved conversation title on the default chat surface', () => {
    jotaiStore.set(currentAiChatThreadState.atom, 'thread-id');
    jotaiStore.set(agentChatThreadListState.atom, {
      threadIds: ['thread-id'],
      hasNextPage: false,
      endCursor: null,
    });
    jotaiStore.set(recordStoreFamilyState.atomFamily('thread-id'), {
      id: 'thread-id',
      __typename: 'AgentChatThread',
      title: 'Existing conversation',
    });

    render(
      <Provider store={jotaiStore}>
        <I18nProvider i18n={i18n}>
          <AiChatPageHeader />
        </I18nProvider>
      </Provider>,
    );

    expect(screen.getByText('Existing conversation')).toBeVisible();
  });

  it('titles the page of a chat that has no record yet', () => {
    render(
      <I18nProvider i18n={i18n}>
        <AiChatPageHeader />
      </I18nProvider>,
    );

    expect(screen.getByText('New chat')).toBeVisible();
  });
});
