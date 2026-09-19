import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { AiChatThreadChannelChip } from '@/ai/components/AiChatThreadChannelChip';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const THREAD_ID = 'thread-1';
const SALES = {
  id: 'channel-sales',
  name: 'Sales',
  visibility: 'PUBLIC',
};
const LEADERSHIP = {
  id: 'channel-leadership',
  name: 'Leadership',
  visibility: 'PRIVATE',
};

const navigateToAiChatChannelPage = jest.fn();
const setChatThreadChannel = jest.fn();

let thread: Record<string, unknown> | undefined;
let isOwner = true;

jest.mock('@/ai/hooks/useChatChannels', () => ({
  useChatChannels: () => ({
    findChannelById: (id: string) =>
      [SALES, LEADERSHIP].find((channel) => channel.id === id),
    joinedChannels: [SALES, LEADERSHIP],
  }),
}));
jest.mock('@/ai/hooks/useNavigateToAiChatChannelPage', () => ({
  useNavigateToAiChatChannelPage: () => ({ navigateToAiChatChannelPage }),
}));
jest.mock('@/ai/hooks/useChatChannelActions', () => ({
  useChatChannelActions: () => ({ setChatThreadChannel }),
}));
jest.mock('@/ai/hooks/useAiChatThreadById', () => ({
  useAiChatThreadById: () => thread,
}));
jest.mock('@/ai/hooks/useIsCurrentUserAiChatThreadOwner', () => ({
  useIsCurrentUserAiChatThreadOwner: () => ({ isOwner, isKnown: true }),
}));

const renderChip = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <AiChatThreadChannelChip threadId={THREAD_ID} channelId={SALES.id} />
      </I18nProvider>
    </JotaiProvider>,
  );

describe('AiChatThreadChannelChip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    thread = { id: THREAD_ID, channelId: SALES.id, workflowRunId: null };
    isOwner = true;
  });

  it('hands a chat to another channel from the header', async () => {
    const user = userEvent.setup();

    renderChip();

    await user.click(screen.getByTitle('Sales'));
    await user.click(screen.getByText('Move to another channel'));
    await user.click(screen.getByText('Leadership'));

    expect(setChatThreadChannel).toHaveBeenCalledWith({
      threadId: THREAD_ID,
      channelId: LEADERSHIP.id,
    });
  });

  it('still opens the channel it is in', async () => {
    const user = userEvent.setup();

    renderChip();

    await user.click(screen.getByTitle('Sales'));
    await user.click(screen.getByText('Open Sales'));

    expect(navigateToAiChatChannelPage).toHaveBeenCalledWith(SALES.id);
    expect(setChatThreadChannel).not.toHaveBeenCalled();
  });

  it('stays a plain shortcut for a reader who cannot move the chat', async () => {
    const user = userEvent.setup();

    isOwner = false;
    renderChip();

    await user.click(screen.getByTitle('Sales'));

    expect(screen.queryByText('Move to another channel')).toBeNull();
    expect(navigateToAiChatChannelPage).toHaveBeenCalledWith(SALES.id);
  });

  it('never offers to move a workflow run conversation', async () => {
    const user = userEvent.setup();

    thread = { id: THREAD_ID, channelId: SALES.id, workflowRunId: 'run-1' };
    renderChip();

    await user.click(screen.getByTitle('Sales'));

    expect(screen.queryByText('Move to another channel')).toBeNull();
  });
});
