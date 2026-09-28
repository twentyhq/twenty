import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';

import { setAgentChatThreadPermissions } from '@/ai/testing/setAgentChatThreadPermissions';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetActionChatThreadAttach } from '@/page-layout/widgets/chat-threads/components/WidgetActionChatThreadAttach';
import { type AgentChatThread } from '~/generated-metadata/graphql';

const attachChatThreadToRecord = jest.fn();
const detachChatThreadFromRecord = jest.fn();

jest.mock('@/ai/hooks/useChatThreadRecordAttachmentActions', () => ({
  useChatThreadRecordAttachmentActions: () => ({
    attachChatThreadToRecord,
    detachChatThreadFromRecord,
  }),
}));

const buildThread = (
  id: string,
  title: string,
  overrides: Partial<AgentChatThread> = {},
): AgentChatThread => ({
  __typename: 'AgentChatThread',
  id,
  title,
  createdAt: '2026-09-07T00:00:00.000Z',
  updatedAt: '2026-09-07T00:00:00.000Z',
  lastMessageAt: '2026-09-07T00:00:00.000Z',
  totalInputTokens: 0,
  totalOutputTokens: 0,
  totalCacheReadTokens: 0,
  conversationSize: 0,
  totalInputCredits: 0,
  totalOutputCredits: 0,
  ...overrides,
});

const ATTACHED_THREAD = buildThread('thread-pricing', 'Pricing call');
const DETACHED_THREAD = buildThread('thread-renewal', 'Renewal plan');
const READ_ONLY_THREAD = buildThread('thread-shared', 'Shared by a teammate');
const ARCHIVED_THREAD = buildThread('thread-archived', 'Old kickoff', {
  deletedAt: '2026-09-08T00:00:00.000Z',
});

jest.mock('@/ai/hooks/useChatThreadsForRecord', () => ({
  useChatThreadsForRecord: () => ({
    threads: [ATTACHED_THREAD],
    loading: false,
    error: undefined,
    refetch: jest.fn(),
  }),
}));

jest.mock('@/ui/layout/contexts/useTargetRecord', () => ({
  useTargetRecord: () => ({
    id: '20202020-0000-4000-8000-000000000002',
    targetObjectNameSingular: 'company',
  }),
}));

jest.mock('@/settings/roles/hooks/useHasPermissionFlag', () => ({
  useHasPermissionFlag: () => true,
}));

const EDITABLE_PERMISSIONS = {
  canRead: true,
  canUpdate: true,
  canDelete: true,
  canSoftDelete: true,
};

const renderAction = () => {
  const store = createStore();

  store.set(metadataStoreState.atomFamily('agentChatThreads'), {
    current: [
      ATTACHED_THREAD,
      DETACHED_THREAD,
      READ_ONLY_THREAD,
      ARCHIVED_THREAD,
    ],
    draft: [],
    status: 'up-to-date',
  });
  setAgentChatThreadPermissions(
    store,
    ATTACHED_THREAD.id,
    EDITABLE_PERMISSIONS,
  );
  setAgentChatThreadPermissions(
    store,
    DETACHED_THREAD.id,
    EDITABLE_PERMISSIONS,
  );
  setAgentChatThreadPermissions(
    store,
    ARCHIVED_THREAD.id,
    EDITABLE_PERMISSIONS,
  );
  setAgentChatThreadPermissions(store, READ_ONLY_THREAD.id, {
    ...EDITABLE_PERMISSIONS,
    canUpdate: false,
  });

  render(
    <I18nProvider i18n={i18n}>
      <Provider store={store}>
        <WidgetActionChatThreadAttach
          widget={{ id: 'widget-chat-threads' } as PageLayoutWidget}
        />
      </Provider>
    </I18nProvider>,
  );
};

describe('WidgetActionChatThreadAttach', () => {
  beforeEach(() => {
    attachChatThreadToRecord.mockReset();
    detachChatThreadFromRecord.mockReset();
  });

  it('offers the conversations the member can edit, with the attached ones checked', async () => {
    const user = userEvent.setup();

    renderAction();

    await user.click(
      screen.getByRole('button', { name: 'Attach conversation' }),
    );

    expect(
      await screen.findByRole('button', {
        name: 'Pricing call',
        pressed: true,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Renewal plan', pressed: false }),
    ).toBeInTheDocument();
    // The server refuses to file a conversation the member can only read, and
    // archived conversations stay out as they do from the chat's own list.
    expect(screen.queryByText('Shared by a teammate')).not.toBeInTheDocument();
    expect(screen.queryByText('Old kickoff')).not.toBeInTheDocument();
  });

  it('attaches an unchecked conversation and detaches a checked one', async () => {
    const user = userEvent.setup();

    renderAction();

    await user.click(
      screen.getByRole('button', { name: 'Attach conversation' }),
    );
    await user.click(
      await screen.findByRole('button', { name: 'Renewal plan' }),
    );
    await user.click(screen.getByRole('button', { name: 'Pricing call' }));

    expect(attachChatThreadToRecord).toHaveBeenCalledWith(DETACHED_THREAD.id);
    expect(detachChatThreadFromRecord).toHaveBeenCalledWith(ATTACHED_THREAD.id);
  });

  it('narrows the conversations to the search', async () => {
    const user = userEvent.setup();

    renderAction();

    await user.click(
      screen.getByRole('button', { name: 'Attach conversation' }),
    );
    await user.type(
      await screen.findByLabelText('Search conversations'),
      'renew',
    );

    expect(
      screen.getByRole('button', { name: 'Renewal plan' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Pricing call')).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText('Search conversations'));
    await user.type(screen.getByLabelText('Search conversations'), 'budget');

    expect(screen.getByText('No conversations')).toBeInTheDocument();
  });
});
