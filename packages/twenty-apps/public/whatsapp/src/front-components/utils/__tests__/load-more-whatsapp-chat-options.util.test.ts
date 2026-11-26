import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  enqueueSnackbar: vi.fn(),
  fetchWhatsappChatOptions: vi.fn(),
}));

vi.mock('twenty-sdk/front-component', () => ({
  enqueueSnackbar: mocks.enqueueSnackbar,
  t: (message: string) => message,
}));

vi.mock('src/front-components/utils/fetch-whatsapp-chat-options.util', () => ({
  fetchWhatsappChatOptions: mocks.fetchWhatsappChatOptions,
}));

const { loadMoreWhatsappChatOptions } =
  await import('src/front-components/utils/load-more-whatsapp-chat-options.util');

describe('loadMoreWhatsappChatOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the longer list', async () => {
    const page = { chats: [], hasMore: false };

    mocks.fetchWhatsappChatOptions.mockResolvedValue(page);

    await expect(loadMoreWhatsappChatOptions(100)).resolves.toBe(page);
    expect(mocks.fetchWhatsappChatOptions).toHaveBeenCalledExactlyOnceWith(100);
    expect(mocks.enqueueSnackbar).not.toHaveBeenCalled();
  });

  it('reports a failed request and returns no list, so the loaded one stays', async () => {
    mocks.fetchWhatsappChatOptions.mockRejectedValue(new Error('boom'));

    await expect(loadMoreWhatsappChatOptions(100)).resolves.toBeUndefined();
    expect(mocks.enqueueSnackbar).toHaveBeenCalledExactlyOnceWith({
      message: 'Could not load more WhatsApp conversations.',
      variant: 'error',
    });
  });
});
