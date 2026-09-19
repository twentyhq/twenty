import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { AiChatJoinChannelBanner } from '@/ai/components/AiChatJoinChannelBanner';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const THREAD_ID = 'thread-1';
const CHANNEL_ID = 'channel-1';

const joinChatChannel = jest.fn();
let thread: Record<string, unknown> | undefined;
let channel: Record<string, unknown> | undefined;

jest.mock('@/ai/hooks/useAiChatThreadById', () => ({
  useAiChatThreadById: () => thread,
}));
jest.mock('@/ai/hooks/useChatChannels', () => ({
  useChatChannels: () => ({ findChannelById: () => channel }),
}));
jest.mock('@/ai/hooks/useChatChannelActions', () => ({
  useChatChannelActions: () => ({ joinChatChannel }),
}));

const renderBanner = () =>
  render(
    <I18nProvider i18n={i18n}>
      <AiChatJoinChannelBanner threadId={THREAD_ID} />
    </I18nProvider>,
  );

describe('AiChatJoinChannelBanner', () => {
  beforeEach(() => {
    joinChatChannel.mockClear();
    thread = { id: THREAD_ID, channelId: CHANNEL_ID };
    channel = { id: CHANNEL_ID, name: 'Sales' };
  });

  it('names the channel the reader has to join to write', () => {
    renderBanner();

    expect(
      screen.getByText('Join Sales to write in this conversation'),
    ).toBeInTheDocument();
  });

  it('joins the channel on click', async () => {
    renderBanner();

    await userEvent.click(screen.getByRole('button', { name: 'Join channel' }));

    expect(joinChatChannel).toHaveBeenCalledWith(CHANNEL_ID);
  });

  it('shows nothing for a thread that is not in a channel', () => {
    channel = undefined;

    const { container } = renderBanner();

    expect(container).toBeEmptyDOMElement();
  });
});
