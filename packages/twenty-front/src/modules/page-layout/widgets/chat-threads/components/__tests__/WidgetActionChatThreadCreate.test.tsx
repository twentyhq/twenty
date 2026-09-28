import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatPendingRecordTargetByDraftKeyState } from '@/ai/states/agentChatPendingRecordTargetByDraftKeyState';
import { agentChatPrepromptState } from '@/ai/states/agentChatPrepromptState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { WidgetActionChatThreadCreate } from '@/page-layout/widgets/chat-threads/components/WidgetActionChatThreadCreate';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const COMPANY_ID = '20202020-0000-4000-8000-000000000002';

const switchToNewChat = jest.fn();
const mockHasPermissionFlag = jest.fn(() => true);

jest.mock('@/ai/hooks/useSwitchToNewAiChat', () => ({
  useSwitchToNewAiChat: () => ({ switchToNewChat }),
}));

jest.mock('@/ui/layout/contexts/useTargetRecord', () => ({
  useTargetRecord: () => ({
    id: COMPANY_ID,
    targetObjectNameSingular: 'company',
  }),
}));

jest.mock('@/settings/roles/hooks/useHasPermissionFlag', () => ({
  useHasPermissionFlag: () => mockHasPermissionFlag(),
}));

const renderAction = () =>
  render(
    <I18nProvider i18n={i18n}>
      <WidgetActionChatThreadCreate />
    </I18nProvider>,
    {
      wrapper: getJestMetadataAndApolloMocksWrapper({
        onInitializeJotaiStore: (store) => {
          store.set(recordStoreFamilyState.atomFamily(COMPANY_ID), {
            __typename: 'Company',
            id: COMPANY_ID,
            name: 'Acme',
          });
        },
      }),
    },
  );

describe('WidgetActionChatThreadCreate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasPermissionFlag.mockReturnValue(true);
  });

  it('starts a new conversation with the record mentioned in the composer', async () => {
    const user = userEvent.setup();

    renderAction();

    await user.click(screen.getByRole('button', { name: 'New conversation' }));

    expect(switchToNewChat).toHaveBeenCalledTimes(1);

    const newChatDraft = JSON.parse(
      jotaiStore.get(agentChatDraftsByThreadIdState.atom)[
        AGENT_CHAT_NEW_THREAD_DRAFT_KEY
      ],
    );

    expect(newChatDraft.content[0].content[0]).toEqual({
      type: 'mentionTag',
      attrs: expect.objectContaining({
        recordId: COMPANY_ID,
        objectNameSingular: 'company',
        label: 'Acme',
      }),
    });
    expect(jotaiStore.get(agentChatPrepromptState.atom)?.mode).toBe('PREFILL');
    expect(
      jotaiStore.get(agentChatPendingRecordTargetByDraftKeyState.atom),
    ).toEqual({
      [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]: {
        objectNameSingular: 'company',
        recordId: COMPANY_ID,
      },
    });
  });

  it('is hidden from members who cannot use AI', () => {
    mockHasPermissionFlag.mockReturnValue(false);

    renderAction();

    expect(
      screen.queryByRole('button', { name: 'New conversation' }),
    ).not.toBeInTheDocument();
  });
});
