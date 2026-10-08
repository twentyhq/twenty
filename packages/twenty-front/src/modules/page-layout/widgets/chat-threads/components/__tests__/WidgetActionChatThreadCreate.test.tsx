import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { tipTapDocumentToMarkdown } from 'twenty-shared/utils';

import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { getConversationTargetsFromSerializedDocument } from '@/ai/utils/getConversationTargetsFromSerializedDocument';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { WidgetActionChatThreadCreate } from '@/page-layout/widgets/chat-threads/components/WidgetActionChatThreadCreate';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const COMPANY_ID = '20202020-0000-4000-8000-000000000002';
const NEW_CHAT_ID = '20202020-0000-4000-8000-0000000000dd';

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
          store.set(newAiChatThreadIdState.atom, NEW_CHAT_ID);
          store.set(recordStoreFamilyState.atomFamily(COMPANY_ID), {
            __typename: 'Company',
            id: COMPANY_ID,
            name: 'Acme',
          });
        },
      }),
    },
  );

const readPersistedNewChatDraft = (): string =>
  JSON.parse(localStorage.getItem('ai/agentChatDraftsByThreadIdState') ?? '{}')[
    NEW_CHAT_ID
  ] ?? '';

describe('WidgetActionChatThreadCreate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockHasPermissionFlag.mockReturnValue(true);
  });

  it('starts a new conversation that mentions the record to file it under', async () => {
    const user = userEvent.setup();

    renderAction();

    await user.click(screen.getByRole('button', { name: 'New conversation' }));

    expect(switchToNewChat).toHaveBeenCalledTimes(1);
    expect(
      getConversationTargetsFromSerializedDocument(readPersistedNewChatDraft()),
    ).toEqual([{ objectNameSingular: 'company', recordId: COMPANY_ID }]);
    expect(tipTapDocumentToMarkdown(readPersistedNewChatDraft())).toContain(
      'Acme',
    );
  });

  it('is hidden from members who cannot use AI', () => {
    mockHasPermissionFlag.mockReturnValue(false);

    renderAction();

    expect(
      screen.queryByRole('button', { name: 'New conversation' }),
    ).not.toBeInTheDocument();
  });
});
